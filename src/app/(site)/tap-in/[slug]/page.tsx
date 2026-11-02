// FILE PATH: src/app/(site)/tap-in/[slug]/page.tsx
import { redirect } from "next/navigation";

// T.A.P IN has no separate listing pages. Old listing URLs forward to the same listing's panel on /tap-in.
export const dynamic = "force-dynamic";

export default async function TapInListingRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/tap-in#${encodeURIComponent(slug)}`);
}