import { createHash, createHmac } from "node:crypto";
import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { cmsBridge, type CmsRecord } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
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
    const resend = new Resend(apiKey);
    const summary = String(product.data?.summary || product.data?.description || "The product is now available from The Africa Plug.").slice(0, 1200);
    const productUrl = new URL("/store/" + product.slug, origin).toString();
    let sent = 0;
    let updated = 0;

    for (let offset = 0; offset < recipients.length; offset += 100) {
      const chunk = recipients.slice(offset, offset + 100);
      const messages = chunk.map(([email, rows]) => {
        const primary = rows[0];
        const name = String(primary.data?.name || "there").slice(0, 120);
        const optOut = unsubscribeUrl(primary, email, origin);
        const productTitle = escapeHtml(product.title);
        const safeSummary = escapeHtml(summary);
        const safeName = escapeHtml(name);
        return {
          from,
          to: [email],
          replyTo: process.env.EMAIL_CONNECT || "connect@theafricaplug.com",
          subject: "It's ready: " + product.title,
          text: "Hello " + name + ",\n\nYou asked to hear when " + product.title + " became available. It is now ready.\n\n" + summary + "\n\nView the product: " + productUrl + "\n\nUnsubscribe from updates about this product: " + optOut + "\n\nThe Africa Plug",
          html: "<div style='background:#f7f5f1;padding:28px 16px;font-family:Arial,sans-serif;color:#202020'><div style='max-width:620px;margin:0 auto;background:#fff;border:1px solid #e8e3dc;padding:30px'><p style='font-size:11px;letter-spacing:3px;font-weight:700;color:#d90062'>THE AFRICA PLUG</p><p style='font-size:12px;letter-spacing:1px;color:#777'>A PRODUCT YOU FOLLOW IS NOW AVAILABLE</p><h1 style='font-family:Georgia,serif;font-size:30px;line-height:1.1'>" + productTitle + "</h1><p>Hello " + safeName + ",</p><p>You asked us to let you know when this product was ready. It is now available.</p><p style='line-height:1.6'>" + safeSummary + "</p><p style='margin:28px 0'><a href='" + productUrl + "' style='display:inline-block;padding:14px 22px;background:#ed0065;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px'>VIEW PRODUCT →</a></p><hr style='border:0;border-top:1px solid #eee;margin:28px 0'><p style='font-size:11px;line-height:1.6;color:#777'>You are receiving this email because you asked for an update about this specific product. <a href='" + optOut + "' style='color:#a8004c'>Unsubscribe from this product's updates</a>.</p><p style='font-size:11px;color:#888'>The Africa Plug · connect@theafricaplug.com</p></div></div>",
          headers: {
            "List-Unsubscribe": "<" + optOut + ">",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        };
      });
      const chunkIds = chunk.flatMap(([, rows]) => rows.map((row) => row.id)).sort().join("|");
      const idempotency = "tap-store-waitlist-" + product.id + "-" + createHash("sha256").update(chunkIds).digest("hex").slice(0, 40);
      const result = await resend.batch.send(messages, { headers: { "Idempotency-Key": idempotency } });
      if (result.error) {
        return Response.json({ error: "Email provider rejected the campaign after " + sent + " successful recipients: " + result.error.message, sent }, { status: 502 });
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
