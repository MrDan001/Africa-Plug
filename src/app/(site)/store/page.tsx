// FILE PATH: src/app/(site)/store/page.tsx
import type { Metadata } from "next";
import StoreCatalogue from "@/components/store/StoreCatalogue";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Store | The Africa Plug", description: "Practical resources from The Africa Plug." };
export default function StorePage() { return <StoreCatalogue />; }