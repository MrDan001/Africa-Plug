import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
      <h1>404</h1>
      <p>This page could not be found.</p>
      <Link href="/">Back to the homepage</Link>
    </main>
  );
}