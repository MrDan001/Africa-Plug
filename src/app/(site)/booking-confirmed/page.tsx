import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Booking confirmed | The Africa Plug",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    uid?: string | string[];
    title?: string | string[];
    attendeeName?: string | string[];
    attendeeFirstName?: string | string[];
    attendeeStartTime?: string | string[];
    startTime?: string | string[];
    endTime?: string | string[];
  }>;
};

function value(input: string | string[] | undefined) {
  return typeof input === "string" ? input.trim().slice(0, 200) : "";
}

function formatDate(input: string) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export default async function BookingConfirmedPage({ searchParams }: Props) {
  const params = await searchParams;
  const bookingId = value(params.uid);
  const eventTitle = value(params.title) || "Your session";
  const attendee = value(params.attendeeFirstName) || value(params.attendeeName);
  const bookedTime = formatDate(value(params.attendeeStartTime) || value(params.startTime));
  const endTime = formatDate(value(params.endTime));

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(64px,10vw,120px) 24px", textAlign: "center" }}>
      <p className="standard-eyebrow">THE AFRICA PLUG · BOOKING CONFIRMATION</p>
      <div aria-hidden="true" style={{ width: 64, height: 64, margin: "0 auto 24px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#f7e7f0", color: "#b32668", fontSize: 32, fontWeight: 800 }}>✓</div>
      <h1 style={{ fontSize: "clamp(36px,7vw,64px)", letterSpacing: "-.05em", lineHeight: 1.02, margin: "16px 0" }}>
        Your booking is confirmed.
      </h1>
      <p style={{ maxWidth: 570, margin: "0 auto 28px", lineHeight: 1.8, color: "#626469" }}>
        {attendee ? `Thank you, ${attendee}. ` : "Thank you. "}
        Your session with The Africa Plug has been scheduled successfully. A confirmation and the meeting details should also arrive by email from the booking system.
      </p>
      <section aria-label="Booking details" style={{ maxWidth: 560, margin: "0 auto 32px", padding: 24, border: "1px solid #e2ddd5", background: "#fff", textAlign: "left" }}>
        <p style={{ margin: "0 0 6px", color: "#777", fontSize: 12, letterSpacing: ".12em", fontWeight: 700 }}>SESSION</p>
        <h2 style={{ margin: "0 0 18px", fontSize: 22 }}>{eventTitle}</h2>
        {bookedTime ? <p style={{ margin: "0 0 8px", lineHeight: 1.7 }}><strong>Starts:</strong> {bookedTime}</p> : null}
        {endTime ? <p style={{ margin: 0, lineHeight: 1.7 }}><strong>Ends:</strong> {endTime}</p> : null}
        {bookingId ? <p style={{ margin: "16px 0 0", color: "#777", fontSize: 12 }}>Booking reference: {bookingId}</p> : null}
      </section>
      <p style={{ maxWidth: 560, margin: "0 auto 28px", lineHeight: 1.8, color: "#626469" }}>
        Please check your inbox for the calendar invitation and any joining instructions. We look forward to speaking with you.
      </p>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20 }}>
        <Link href="/" className="text-link">BACK TO THE AFRICA PLUG →</Link>
        <Link href="/work-with-fk" className="text-link">WORK WITH FK →</Link>
      </div>
    </main>
  );
}
