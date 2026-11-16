import type { Metadata } from "next";
import ContentPage from "@/components/layout/ContentPage";
import WorkApplyForm from "@/components/work-with-fk/WorkApplyForm";

export const metadata: Metadata = {
  title: { absolute: "Start Your Application | Work With FK | The Africa Plug" },
  description: "Send your brief to FK. If it’s a fit, you receive fees, terms and a private link to book your Deal Diagnostic.",
  alternates: { canonical: "/work-with-fk/apply" },
};

export default function WorkWithFkApplyPage() {
  return (
    <ContentPage
      eyebrow="WORK WITH FK"
      title="START YOUR APPLICATION."
      description="Send your brief. If it’s a fit, you receive fees, terms and a private link to book."
    >
      <p className="wfk-nda-note">
        Please don’t share confidential details here. If needed, an NDA can be signed before your Deal Diagnostic.
      </p>
      <WorkApplyForm />
    </ContentPage>
  );
}