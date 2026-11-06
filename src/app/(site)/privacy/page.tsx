import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/layout/LegalPages";

export const metadata: Metadata = { title: { absolute: "Privacy Policy | The Africa Plug" }, alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
