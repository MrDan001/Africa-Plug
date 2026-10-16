import type { Metadata } from "next";
import BookShelf from "@/components/store/BookShelf";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Store | The Africa Plug", description: "Practical resources from The Africa Plug. The first release is being prepared." };
export default function StorePage() { return <BookShelf />; }
