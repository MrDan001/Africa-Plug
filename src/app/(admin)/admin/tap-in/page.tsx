import type { Metadata } from "next";
import TapInManager from "@/components/admin/TapInManager";

export const metadata: Metadata = {
  title: "T.A.P IN Opportunity Manager | Africa Plug Admin",
  robots: { index: false, follow: false },
};

export default function AdminTapInPage() {
  return <TapInManager />;
}
