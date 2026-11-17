import { cmsBridge } from "@/lib/cms-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let input: { email?: unknown; name?: unknown; website?: unknown; source?: unknown };
  try { input = await request.json() as typeof input; }
  catch { return Response.json({ error: "Enter a valid email address and try again." }, { status: 400 }); }

  if (typeof input.website === "string" && input.website) return Response.json({ ok: true });

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;
  if (!apiKey || !groupId) {
    console.error("Stay Plugged In signup is missing MailerLite configuration.");
    return Response.json({ error: "Newsletter sign-up is temporarily unavailable. Please try again later." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const name = typeof input.name === "string" ? input.name.trim().slice(0, 160) : "";
  try {
    const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        groups: [groupId],
        ...(name ? { fields: { name } } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("MailerLite rejected Stay Plugged In signup:", response.status, detail.slice(0, 500));
      return Response.json({ error: "We couldn't complete your newsletter sign-up just now. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    await cmsBridge({
      action: "cms.save",
      module: "subscribers",
      record: {
        title: email,
        slug: email.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 170),
        status: "active",
        data: {
          email,
          name,
          source: typeof input.source === "string" ? input.source.slice(0, 100) : "Stay Plugged In",
          list: "stay-plugged-in",
          provider: "mailerlite",
          consent: true,
          subscribedAt: new Date().toISOString(),
        },
      },
    });
    try {
      await cmsBridge({
        action: "cms.save",
        module: "analytics",
        record: {
          title: "form_submit · newsletter",
          slug: null,
          status: "recorded",
          data: {
            eventName: "form_submit",
            path: "/",
            source: typeof input.source === "string" ? input.source.slice(0, 100) : "Stay Plugged In",
            label: "Newsletter signup",
            recordedAt: new Date().toISOString(),
          },
        },
      });
    } catch (analyticsError) {
      console.error("Newsletter conversion could not be recorded:", analyticsError instanceof Error ? analyticsError.message : "Unknown error");
    }
    return Response.json({ ok: true, message: "You're signed up. Stay Plugged In." });
  } catch (error) {
    console.error("Newsletter signup could not be completed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn't save your signup just now. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
