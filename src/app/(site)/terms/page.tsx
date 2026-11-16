import type { Metadata } from "next";
import { TermsOfUse } from "@/components/layout/LegalPages";

export const metadata: Metadata = { title: { absolute: "Terms of Use | The Africa Plug" }, description: "Read the terms governing access to and use of The Africa Plug website, content and services.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <TermsOfUse />;
}
