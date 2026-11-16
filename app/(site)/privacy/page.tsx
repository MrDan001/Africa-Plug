import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/layout/LegalPages";

export const metadata: Metadata = { title: { absolute: "Privacy Policy | The Africa Plug" }, description: "Read how The Africa Plug handles personal information submitted through its website, forms and services.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
