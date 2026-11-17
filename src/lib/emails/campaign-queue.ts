import "server-only";
import { createHash } from "node:crypto";
import { cmsBridge, type CmsModule, type CmsRecord } from "@/lib/cms-bridge";
import { sendClientEmail } from "@/lib/emails/send";
import type { EmailId } from "@/lib/emails/templates";
import type { EmailVarValues } from "@/lib/emails/layout";

type SourceUpdate = {
  module: CmsModule;
  record: Pick<CmsRecord, "id" | "title" | "slug" | "status"> & { data: Record<string, unknown> };
};
export type CampaignQueueEntry = {
  campaign: string; to: string; template: EmailId;
  vars: EmailVarValues & { firstName?: string };
  idempotencyKey: string; headers?: Record<string, string>; sourceUpdates?: SourceUpdate[];
};
type QueueData = CampaignQueueEntry & {
  kind: "email-campaign-queue"; scheduledAt: string; attemptCount: number;
  sentAt?: string; sentDay?: string; lastError?: string;
};
const MODULE = "analytics" as const;
const DAILY_LIMIT = 100;

function queueId(key: string) {
  const h = createHash("sha256").update("tap-email-queue:" + key).digest("hex").slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
function nextUtcDay() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 10)).toISOString();
}
async function listQueue() {
  const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: MODULE, status: "all" });
  return (result.records ?? []).filter((r) => r.data?.kind === "email-campaign-queue");
}
async function saveQueue(id: string, campaign: string, status: string, data: QueueData) {
  await cmsBridge({
    action: "cms.save", module: MODULE,
    record: { id, title: `Email queue · ${campaign}`, slug: null, status, data: data as unknown as Record<string, unknown> },
  });
}

export async function processEmailCampaignQueue() {
  const records = await listQueue();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sentToday = records.filter((r) => r.status === "sent" && r.data?.sentDay === today).length;
  const allowance = Math.max(0, DAILY_LIMIT - sentToday);
  const due = records
    .filter((r) => r.status === "queued" && Date.parse(String(r.data?.scheduledAt ?? "")) <= now.getTime())
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, allowance);
  let sent = 0;
  let failed = 0;
  for (const record of due) {
    const data = record.data as unknown as QueueData;
    const result = await sendClientEmail(data.template, data.to, data.vars, {
      idempotencyKey: data.idempotencyKey, headers: data.headers,
    });
    if (result.status === "sent") {
      const sentAt = new Date().toISOString();
      await saveQueue(record.id, data.campaign, "sent", { ...data, sentAt, sentDay: today, lastError: undefined });
      for (const update of data.sourceUpdates ?? []) {
        try {
          const sourceData = Object.fromEntries(Object.entries(update.record.data).map(([key, value]) =>
            [key, value === "__EMAIL_SENT_AT__" ? sentAt : value]
          ));
          await cmsBridge({
            action: "cms.save",
            module: update.module,
            record: { ...update.record, data: sourceData },
          });
        } catch (error) {
          console.error("Email campaign source record could not be marked as notified:", error instanceof Error ? error.message : "Unknown error");
        }
      }
      sent++;
    } else {
      const attempts = Number(data.attemptCount || 0) + 1;
      await saveQueue(record.id, data.campaign, attempts >= 5 ? "failed" : "queued", {
        ...data, attemptCount: attempts, scheduledAt: nextUtcDay(), lastError: result.error || result.status,
      });
      failed++;
    }
  }
  const refreshed = await listQueue();
  return {
    sent, failed,
    sentToday: sentToday + sent,
    remaining: refreshed.filter((r) => r.status === "queued").length,
    dailyLimit: DAILY_LIMIT,
  };
}

/** Queue every eligible recipient; only the remaining daily allowance is sent now. */
export async function queueAndSendCampaign(entries: CampaignQueueEntry[]) {
  const existing = await listQueue();
  const existingIds = new Set(existing.map((r) => r.id));
  const unique = new Map<string, CampaignQueueEntry>();
  for (const entry of entries) {
    const email = entry.to.trim().toLowerCase();
    if (email && entry.idempotencyKey) unique.set(queueId(entry.idempotencyKey), { ...entry, to: email });
  }
  const pending = Array.from(unique.entries()).filter(([id]) => !existingIds.has(id));
  for (let i = 0; i < pending.length; i += 20) {
    await Promise.all(pending.slice(i, i + 20).map(([id, entry]) => {
      const data: QueueData = {
        ...entry, kind: "email-campaign-queue",
        scheduledAt: new Date().toISOString(), attemptCount: 0,
      };
      return saveQueue(id, entry.campaign, "queued", data);
    }));
  }
  await processEmailCampaignQueue();
  const refreshed = await listQueue();
  const ids = new Set(unique.keys());
  const own = refreshed.filter((r) => ids.has(r.id));
  return {
    enqueued: unique.size,
    sent: own.filter((r) => r.status === "sent").length,
    queued: own.filter((r) => r.status === "queued").length,
    failed: own.filter((r) => r.status === "failed").length,
  };
}
