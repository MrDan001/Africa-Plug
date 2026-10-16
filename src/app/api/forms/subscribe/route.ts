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

  const slug = email.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 170);
  try {
    await cmsBridge({
      action: "cms.save",
      module: "subscribers",
      record: {
        title: email,
        slug,
        status: "active",
        data: {
          email,
          name: typeof input.name === "string" ? input.name.trim().slice(0, 160) : "",
          source: typeof input.source === "string" ? input.source.slice(0, 100) : "Stay Plugged In",
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
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Newsletter signup could not be stored:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "We couldn't save your signup just now. Please try again shortly." }, { status: 503 });
  }
}
