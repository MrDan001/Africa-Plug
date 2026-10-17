// FILE PATH: src/app/(site)/work-with-fk/schedule/[token]/page.tsx
import type { Metadata } from "next";
import ContentPage from "@/components/layout/ContentPage";
import SchedulerClient from "@/components/work-with-fk/SchedulerClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Private scheduler | The Africa Plug",
  robots: { index: false, follow: false },
};

export default async function PrivateSchedulerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <ContentPage
      eyebrow="WORK WITH FK"
      title="CHOOSE YOUR MEETING TIME."
      description="This private page is only for approved applicants. Please do not share the link."
    >
      <SchedulerClient token={token} />
    </ContentPage>
  );
}
