// FILE PATH: src/app/(site)/store/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCmsRecord, getPublicCmsRecords } from "@/lib/cms-bridge";
import { cmsRecordToPublicProduct } from "@/lib/public-cms-content";
import StoreAddToCartButton from "@/components/store/StoreAddToCartButton";
import StoreCartButton from "@/components/store/StoreCartButton";
import StoreEnquiryButton from "@/components/store/StoreEnquiryButton";
import "@/components/store/store-categories.css";
import { getStoreCategory } from "@/lib/store-categories";
import { DEMO_STORE_PRODUCTS } from "@/lib/store-demo-products";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const record = await getPublicCmsRecord("products", slug);
  const product = record ? cmsRecordToPublicProduct(record) : process.env.NODE_ENV === "development"
    ? DEMO_STORE_PRODUCTS.find((item) => item.slug === slug) ?? null
    : null;
  if (product) {
    const rawTitle = product.seoTitle || product.title;
    const cleanTitle = rawTitle.replace(/(?:\s*\|\s*The Africa Plug)+$/i, "").trim();
    return {
      title: { absolute: `${cleanTitle} | The Africa Plug` },
      description: product.seoDescription || product.summary,
      alternates: { canonical: `/store/${encodeURIComponent(slug)}` },
    };
  }
  return { title: { absolute: "The Store | The Africa Plug" }, alternates: { canonical: `/store/${encodeURIComponent(slug)}` } };
}

export async function generateStaticParams() {
  const records = await getPublicCmsRecords("products");
  return records.filter((record) => record.slug && record.status === "active").map((record) => ({ slug: record.slug! }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const record = await getPublicCmsRecord("products", slug);
  const product = record ? cmsRecordToPublicProduct(record) : process.env.NODE_ENV === "development"
    ? DEMO_STORE_PRODUCTS.find((item) => item.slug === slug) ?? null
    : null;
  if (product) {
    const isGuidePreorder = ["explore-africa-like-an-insider", "the-unwritten-rules-of-doing-business-in-africa"].includes(product.slug);
    const available = product.availability === "available";
    const isService = product.category === "services";
    return <div className="tap-product-detail-page">
      <div className="tap-product-detail-topline"><Link href="/store">← Back to The Store</Link><span>THE AFRICA PLUG / STORE</span><div className="tapcart-desktop-only"><StoreCartButton /></div></div>
      <section className="tap-product-detail-layout" aria-labelledby="tap-product-title">
        <div className="tap-product-detail-art">
          {product.imageUrl ? <img src={product.imageUrl} alt={`${product.title} product image`} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="tap-book-cover tap-book-cover--starter tap-detail-book-cover"><span className="tap-book-cover-brand">THE AFRICA PLUG</span><span className="tap-book-cover-index">01</span><span className="tap-book-cover-label">{product.productType}</span><h2>{product.title}</h2><span className="tap-book-cover-rule"/><span className="tap-book-cover-footer">KNOWLEDGE • TOOLS • RESEARCH</span></div>}
        </div>
        <div className="tap-product-detail-copy">
          <p className="tap-book-category">{getStoreCategory(product.category).singular}{isGuidePreorder || !available ? " · Coming soon" : ""}</p><h1 id="tap-product-title">{product.title}</h1><p className="tap-product-detail-summary">{product.description}</p>
          {(available || isGuidePreorder) && !product.externalUrl && product.price > 0 ? <p>{new Intl.NumberFormat("en-GB", { style: "currency", currency: product.currency }).format(product.price)}</p> : null}
          {product.externalUrl ? <><a className="tap-cat-external" href={product.externalUrl} target="_blank" rel="noopener noreferrer sponsored">VISIT <span aria-hidden="true">↗</span></a><p className="tap-cat-note">This link takes you to a partner website.</p></> : isGuidePreorder ? <div className="tap-product-action-row"><StoreAddToCartButton slug={product.slug} title={product.title} price={String(product.price)} currency={product.currency} cover="starter" buttonLabel="PREORDER" /><Link className="tap-product-back-link" href="/refunds">Refunds Policy</Link></div> : !available ? <StoreEnquiryButton title={product.title} buttonLabel="JOIN THE WAITLIST" waitlist productId={product.id} productSlug={product.slug} /> : isService ? <StoreEnquiryButton title={product.title} productId={product.id} productSlug={product.slug} /> : product.price > 0 && product.downloadReady ? <StoreAddToCartButton slug={product.slug} title={product.title} price={String(product.price)} currency={product.currency} cover="starter" /> : <p className="tap-product-checkout-note">A protected guide download is being prepared.</p>}
          {available && !product.externalUrl && product.price > 0 && product.downloadReady ? <p className="tap-product-checkout-note">Secure checkout verifies payment and protected delivery before completing an order.</p> : null}
          {!isGuidePreorder ? <Link className="tap-product-back-link" href="/refunds">Refunds Policy</Link> : null}
        </div>
      </section>
    </div>;
  }

  notFound();
}
