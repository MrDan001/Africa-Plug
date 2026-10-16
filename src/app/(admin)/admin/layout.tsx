import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homepage Images | Africa Plug Admin",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
