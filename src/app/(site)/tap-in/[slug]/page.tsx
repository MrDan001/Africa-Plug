import { redirect } from "next/navigation";

// T.A.P IN has no separate listing pages. Old listing URLs forward to the same listing's panel on /tap-in.
export const dynamic = "force-dynamic";

export default async function TapInListingRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonicalSlug = slug === "excavator-hire-west-africa" ? "excavator-hire" : slug;
  redirect(`/tap-in#${encodeURIComponent(canonicalSlug)}`);
}