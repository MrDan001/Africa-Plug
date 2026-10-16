import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://africa-plug.vercel.app"),
  title: {
    default: "Africa Plug | Business. Investment. Real Opportunity.",
    template: "%s | Africa Plug",
  },
  description: "Africa Plug connects ambitious people and businesses to commercial, investment and partnership opportunities across Africa.",
  openGraph: {
    title: "Africa Plug | Business. Investment. Real Opportunity.",
    description: "Discover opportunities, work with FK, and connect with the people moving business across Africa.",
    siteName: "Africa Plug",
    locale: "en_GB",
    type: "website",
  },
  icons: { icon: "/images/logo-mark.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><AnalyticsTracker />{children}</body>
    </html>
  );
}
