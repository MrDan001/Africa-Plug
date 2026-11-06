import type { Metadata } from "next";
import { TermsOfUse } from "@/components/layout/LegalPages";

export const metadata: Metadata = { title: { absolute: "Terms of Use | The Africa Plug" }, alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <TermsOfUse />;
}
