// FILE PATH: src/app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { getPublicSiteSettings } from "@/lib/cms-bridge";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const title = settings.siteTitle || "The Africa Plug | Investment • Business • Entertainment";
  const description = settings.siteDescription || "The Africa Plug connects commercial ambition with context, relationships and opportunities across African markets.";
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
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The Africa Plug — Your connection to Africa" }],
    },
    icons: { icon: "/images/the-africa-plug-logo.jpg", apple: "/images/the-africa-plug-logo.jpg" },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning><AnalyticsTracker />{children}</body>
    </html>
  );
}