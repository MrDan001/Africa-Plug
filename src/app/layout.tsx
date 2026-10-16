import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { getPublicSiteSettings } from "@/lib/cms-bridge";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const title = settings.siteTitle || "Africa Plug | Business. Investment. Real Opportunity.";
  const description = settings.siteDescription || "Africa Plug connects ambitious people and businesses to commercial, investment and partnership opportunities across Africa.";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://africa-plug.vercel.app"),
    title: { default: title, template: `%s | ${settings.siteTitle || "Africa Plug"}` },
    description,
    openGraph: {
      title,
      description,
      siteName: settings.siteTitle || "Africa Plug",
      locale: "en_GB",
      type: "website",
    },
    icons: { icon: "/images/logo-mark.svg" },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><AnalyticsTracker />{children}</body>
    </html>
  );
}
