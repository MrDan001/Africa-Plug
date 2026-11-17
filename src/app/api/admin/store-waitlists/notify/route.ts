import { createHash, createHmac } from "node:crypto";
import { sendClientEmail } from "@/lib/emails/send";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function sameProduct(record: CmsRecord, product: CmsRecord) {
  const data = record.data ?? {};
  if (data.storeProductId) return data.storeProductId === product.id;
  if (data.storeProductSlug) return data.storeProductSlug === product.slug;
  return String(data.opportunityName ?? "").trim().toLowerCase() === product.title.trim().toLowerCase();
}

function consented(record: CmsRecord) {
  return record.data?.waitlistEmailConsent === true
    && !record.data?.waitlistUnsubscribedAt
    && record.data?.waitlistStatus !== "unsubscribed";
}

function unsubscribeUrl(record: CmsRecord, email: string, origin: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Waitlist unsubscribe signing is not configured.");
  const token = createHmac("sha256", secret).update(record.id + ":" + email.toLowerCase()).digest("hex");
  const url = new URL("/api/store/waitlist/unsubscribe", origin);
  url.searchParams.set("id", record.id);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return Response.json({ error: "Please sign in to the admin workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  let input: { productId?: string };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Choose a Store product first." }, { status: 400 }); }
  if (!input.productId) return Response.json({ error: "Choose a Store product first." }, { status: 400 });

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "Email notifications are not configured. The product waitlist is safe, but add RESEND_API_KEY and EMAIL_FROM before sending." }, { status: 503 });
  }
  if (!process.env.ADMIN_SESSION_SECRET) {
    return Response.json({ error: "Waitlist unsubscribe signing is not configured. Set ADMIN_SESSION_SECRET before sending notifications." }, { status: 503 });
  }

  try {
    const [productResult, listResult] = await Promise.all([
      cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "products", status: "all", id: input.productId }),
      cmsBridge<{ records?: CmsRecord[] }>({ action: "cms.list", module: "enquiries", status: "all" }),
    ]);
    const product = (productResult.records ?? []).find((record) => record.id === input.productId);
    if (!product || product.status !== "active") {
      return Response.json({ error: "This product is not published. Publish it before notifying its waitlist." }, { status: 409 });
    }
    if (product.data?.availability !== "available") {
      return Response.json({ error: "Change this product's availability to Available in Store Products before sending its launch email." }, { status: 409 });
    }

    const matched = (listResult.records ?? []).filter((record) =>
      record.data?.enquiryType === "Store waitlist" && sameProduct(record, product) && consented(record)
    );
    const eligibleByEmail = new Map<string, CmsRecord[]>();
    for (const record of matched) {
      const email = String(record.data?.email ?? "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || record.data?.waitlistLastNotifiedAt) continue;
      const group = eligibleByEmail.get(email) ?? [];
      group.push(record);
      eligibleByEmail.set(email, group);
    }
    const recipients = Array.from(eligibleByEmail.entries());
    if (!recipients.length) {
      return Response.json({
        ok: true,
        sent: 0,
        message: "There are no new, opted-in waitlist members for this product. Existing signups without the explicit product-update consent are not emailed.",
      });
    }
    if (recipients.length > 1000) {
      return Response.json({ error: "This product has more than 1,000 eligible addresses. Split the campaign before sending." }, { status: 413 });
    }

    let origin = "https://theafricaplug.com";
    try { origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || origin).origin; } catch { /* use the verified production site */ }
    const summary = String(product.data?.summary || product.data?.description || "The product is now available from The Africa Plug.").slice(0, 1200);
    const productUrl = new URL("/store/" + product.slug, origin).toString();
    let sent = 0;
    let updated = 0;

    for (let offset = 0; offset < recipients.length; offset += 100) {
      const chunk = recipients.slice(offset, offset + 100);
      for (const [email, rows] of chunk) {
        const primary = rows[0];
        const name = String(primary.data?.name || "").trim();
        const optOut = unsubscribeUrl(primary, email, origin);
        const result = await sendClientEmail("waitlistAvailable", email, {
          firstName: name,
          guideTitle: product.title,
          productLink: productUrl,
          unsubscribeLink: optOut,
        }, { idempotencyKey: "tap-store-waitlist-" + product.id + "-" + createHash("sha256").update(rows.map((row) => row.id).sort().join("|")).digest("hex").slice(0, 40), headers: { "List-Unsubscribe": `<${optOut}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
        if (result.status !== "sent") {
          return Response.json({ error: "Email provider failed after " + sent + " successful recipients: " + (result.error || result.status), sent }, { status: 502 });
        }
      }
      sent += chunk.length;
      const notifiedAt = new Date().toISOString();
      const updates = await Promise.all(chunk.flatMap(([, rows]) => rows.map(async (record) => {
        const data = {
          ...record.data,
          waitlistLastNotifiedAt: notifiedAt,
          waitlistStatus: "notified",
          waitlistLastNotifiedProductSlug: product.slug,
        };
        await cmsBridge({
          action: "cms.save",
          module: "enquiries",
          record: { id: record.id, title: record.title, slug: record.slug, status: record.status, data },
        });
        updated += 1;
      })));
      void updates;
    }

    return Response.json({ ok: true, sent, updated, productTitle: product.title }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Store waitlist campaign failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: error instanceof Error ? error.message : "Could not send the waitlist campaign." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
