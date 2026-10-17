import Hero from "@/components/home/Hero";
import HomeSections from "@/components/home/HomeSections";
import { getHeroImageState } from "@/lib/hero-images";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { images, mobileImages } = await getHeroImageState();
  return (
    <>
      <Hero initialImages={images} initialMobileImages={mobileImages} />
      <HomeSections />
    </>
  );
}
