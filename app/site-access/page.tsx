import SiteGate from "@/components/site/SiteGate";

export const dynamic = "force-dynamic";
export const metadata = { title: "Website Access | The Africa Plug", robots: { index: false, follow: false } };

export default function SiteAccessPage() {
  return <SiteGate />;
}
