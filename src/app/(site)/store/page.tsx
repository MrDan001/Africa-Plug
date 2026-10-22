// FILE PATH: src/app/(site)/store/page.tsx
import type { Metadata } from "next";
import StoreCatalogue from "@/components/store/StoreCatalogue";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Store | The Africa Plug", description: "Ebooks, playbooks, reports, Stay Finder and other TAP products from The Africa Plug." };
type Props = { searchParams: Promise<{ category?: string | string[] }> };
export default async function StorePage({ searchParams }: Props) {
  const { category } = await searchParams;
  return <StoreCatalogue category={category} />;
}