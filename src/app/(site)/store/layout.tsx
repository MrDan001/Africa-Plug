import StoreCartButton from "@/components/store/StoreCartButton";
import { getPublicCmsRecords } from "@/lib/cms-bridge";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const records = await getPublicCmsRecords("products");
  const validProductSlugs = records.filter((record) => record.status === "active" && record.slug).map((record) => record.slug!);
  return (
    <>
      {children}
      <StoreCartButton mobileFloating validProductSlugs={validProductSlugs} />
    </>
  );
}
