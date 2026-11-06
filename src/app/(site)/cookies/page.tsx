import type { Metadata } from "next";
import { CookiePolicy } from "@/components/layout/LegalPages";

export const metadata: Metadata = { title: { absolute: "Cookie Policy | The Africa Plug" }, alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return <CookiePolicy />;
}
