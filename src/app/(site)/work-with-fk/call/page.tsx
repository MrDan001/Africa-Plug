// FILE PATH: src/app/(site)/work-with-fk/call/page.tsx
import type { Metadata } from "next";
import ContentPage from "@/components/layout/ContentPage";
import CallForm from "@/components/work-with-fk/CallForm";

// Reached only from the Work With FK page, so it is kept out of search results.
export const metadata: Metadata = {
  title: { absolute: "A 30 minute call with FK | The Africa Plug" },
  description: "A focused conversation on one specific question about doing business in Africa.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/work-with-fk/call" },
};

export default function WorkWithFkCallPage() {
  return (
    <ContentPage
      eyebrow="WORK WITH FK"
      title="A 30 minute call with FK."
      description="A focused conversation on one specific question about doing business in Africa."
    >
      <div className="wfk-price">
        <p className="wfk-price-line">£350 · 30 minutes · video</p>
        <p className="wfk-price-small">Credited against a Deal Diagnostic if you go on to book one within 30 days.</p>
        <p className="wfk-price-terms">
          You can reschedule once, free of charge, with at least 48 hours’ notice. Missed sessions can’t be refunded or rescheduled. Full terms: <a href="/refunds">Refunds Policy</a>.
        </p>
      </div>
      <CallForm />
    </ContentPage>
  );
}