import type { Metadata } from "next";
import { RefundPolicy } from "@/components/layout/LegalPages";

export const metadata: Metadata = { title: { absolute: "Refund Policy | The Africa Plug" }, alternates: { canonical: "/refunds" } };

export default function DepositRefundTermsPage() {
  return <RefundPolicy />;
}
