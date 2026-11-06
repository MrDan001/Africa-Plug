import type { Metadata } from "next";
import { CookiePolicy } from "@/components/layout/LegalPages";

export const metadata: Metadata = { title: { absolute: "Cookie Policy | The Africa Plug" }, description: "Learn how The Africa Plug uses cookies and similar technologies on this website and how you can manage them.", alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return <CookiePolicy />;
}
