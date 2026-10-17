// FILE PATH: src/lib/work-with-fk/scheduler.ts
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

const LINK_DAYS = 14;

function signingKey() {
  return process.env.SCHEDULER_TOKEN_SECRET || process.env.ADMIN_SESSION_SECRET || null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(`fk-scheduler:${payload}`).digest("base64url");
}

/** Signed private link token: <applicationId>.<version>.<expiresAt>.<signature>. Re-issuing bumps the version, which deactivates older links. */
export function createSchedulerToken(applicationId: string, version: number, days = LINK_DAYS) {
  const key = signingKey();
  if (!key) return null;
  const payload = `${applicationId}.${version}.${Date.now() + days * 86400000}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifySchedulerToken(token: unknown): { id: string; version: number } | null {
  if (typeof token !== "string" || token.length > 300) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [id, versionText, expiresText, signature] = parts;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const key = signingKey();
  if (!key) return null;
  const expected = Buffer.from(sign(`${id}.${versionText}.${expiresText}`, key));
  const supplied = Buffer.from(signature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  const version = Number(versionText);
  const expires = Number(expiresText);
  if (!Number.isInteger(version) || !Number.isFinite(expires) || expires < Date.now()) return null;
  return { id, version };
}

export async function loadApplication(id: string) {
  const found = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "applications", status: "all", id });
  return found.records?.find((item) => item.id === id) ?? null;
}

export async function saveApplicationData(application: CmsRecord, patch: Record<string, unknown>) {
  const result = await cmsBridge<{ record: CmsRecord }>({
    action: "cms.save",
    module: "applications",
    record: {
      id: application.id,
      title: application.title,
      slug: application.slug,
      status: application.status,
      data: { ...(application.data ?? {}), ...patch },
    },
  });
  return result.record;
}

export function paymentConfirmed(application: CmsRecord) {
  return application.data?.paymentStatus === "confirmed";
}

export async function loadBookingSettings() {
  const result = await cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "commercial-settings", status: "all" })
    .catch(() => ({ records: [] as CmsRecord[] }));
  const newest = [...(result.records ?? [])].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0];
  const data = newest?.data ?? {};
  const url = typeof data.bookingUrl === "string" ? data.bookingUrl.trim() : "";
  const minutes = Number(data.meetingMinutes);
  return {
    bookingUrl: /^https:\/\//i.test(url) ? url : null,
    meetingMinutes: Number.isFinite(minutes) && minutes > 0 && minutes <= 480 ? Math.round(minutes) : null,
  };
}

/** A private link only works for an approved application whose payment is confirmed and whose newest link version matches. */
export async function resolveSchedulerAccess(token: unknown): Promise<
  | { ok: true; application: CmsRecord }
  | { ok: false; status: number; error: string }
> {
  const invalid = { ok: false as const, status: 404, error: "This scheduler link is not valid or has expired. Please contact The Africa Plug for a new one." };
  const claims = verifySchedulerToken(token);
  if (!claims) return invalid;
  const application = await loadApplication(claims.id);
  if (!application || application.status !== "approved" || !paymentConfirmed(application)) return invalid;
  if (Number(application.data?.schedulerLinkVersion ?? 0) !== claims.version) return invalid;
  return { ok: true, application };
}

export async function recordServerEvent(eventName: "deposit_paid" | "meeting_booked", label: string) {
  try {
    await cmsBridge({
      action: "cms.save",
      module: "analytics",
      record: {
        title: `${eventName} · /work-with-fk`,
        slug: null,
        status: "recorded",
        data: { eventName, path: "/work-with-fk", source: "server", label, utm: {}, recordedAt: new Date().toISOString() },
      },
    });
  } catch (error) {
    console.error("Work With FK funnel event was not stored:", error instanceof Error ? error.message : "Unknown error");
  }
}

export function siteOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  return configured && /^https?:\/\//i.test(configured) ? configured : new URL(request.url).origin;
}
