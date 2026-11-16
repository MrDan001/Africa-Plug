import type { Metadata } from "next";
import AdminAuthGate from "@/components/admin/AdminAuthGate";

export const metadata: Metadata = {
  title: "Admin Control Room | Africa Plug",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
