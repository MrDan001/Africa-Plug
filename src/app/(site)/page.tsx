import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import HomeSections from "@/components/home/HomeSections";
import { getHeroImageState } from "@/lib/hero-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "The Africa Plug | Africa Commercial Deal Consultant, Market Entry and Investment" },
  description: "FK, Africa Commercial Deal Consultant, helps companies with market entry, regulatory approvals and commercial deals across Africa. Investment, business and entertainment from The Africa Plug.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const { images, mobileImages } = await getHeroImageState();
  return (
    <>
      <Hero initialImages={images} initialMobileImages={mobileImages} />
      <HomeSections />
    </>
  );
}
