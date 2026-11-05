// FILE PATH: src/app/(site)/store/page.tsx
import type { Metadata } from "next";
import StoreCatalogue from "@/components/store/StoreCatalogue";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Africa Plug Store | Africa Travel and Business Guides", description: "Guides and services for exploring, doing business and investing across Africa, from insider travel guides to pet travel consultations." };
type Props = { searchParams: Promise<{ category?: string | string[] }> };
export default async function StorePage({ searchParams }: Props) {
  const { category } = await searchParams;
  return <StoreCatalogue category={category} />;
}
