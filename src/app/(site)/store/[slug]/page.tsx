import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "The Africa Starter Guide | The Africa Plug Store", description: "The first release from The Africa Plug Store is being prepared." };
type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (slug !== "the-africa-starter-guide") notFound();
  return <div className="tap-product-detail-page">
    <div className="tap-product-detail-topline"><a href="/store">← Back to The Store</a><span>THE AFRICA PLUG / STORE</span></div>
    <section className="tap-product-detail-layout" aria-labelledby="tap-product-title">
      <div className="tap-product-detail-art"><div className="tap-book-cover tap-book-cover--starter tap-detail-book-cover"><span className="tap-book-cover-brand">THE AFRICA PLUG</span><span className="tap-book-cover-index">01</span><span className="tap-book-cover-label">FIELD GUIDE</span><h2>The Africa Starter Guide</h2><span className="tap-book-cover-rule"/><span className="tap-book-cover-footer">INVESTMENT • BUSINESS • ENTERTAINMENT</span></div></div>
      <div className="tap-product-detail-copy"><p className="tap-book-category">FIRST RELEASE</p><h1 id="tap-product-title">The Africa Starter Guide</h1><p className="tap-product-detail-summary">A practical starting point for understanding markets, people and opportunities across Africa.</p><p className="tap-product-checkout-note">The launch edition is being prepared. Purchase will open only after the finished product, card payment, receipt and protected digital delivery have been tested.</p><a className="tap-product-back-link" href="/store">BACK TO THE STORE</a></div>
    </section>
  </div>;
}
