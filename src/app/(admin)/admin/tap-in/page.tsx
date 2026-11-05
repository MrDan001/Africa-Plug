import type { Metadata } from "next";
import TapInManager from "@/components/admin/TapInManager";

export const metadata: Metadata = {
  title: "TAP IN Opportunity Manager | Africa Plug Admin",
  robots: { index: false, follow: false },
};

export default function AdminTapInPage() {
  return <TapInManager />;
}
