import Link from "next/link";
import { getPublicCmsRecords } from "@/lib/cms-bridge";
import { cmsRecordToPublicProduct } from "@/lib/public-cms-content";
import { STORE_CATEGORIES, getStoreCategory, parseStoreCategory } from "@/lib/store-categories";
import StoreEnquiryButton from "@/components/store/StoreEnquiryButton";
import "./store-categories.css";
import "./store-page.css";

export const dynamic = "force-dynamic";

type Props = { category?: string | string[] };
type StoreProduct = NonNullable<ReturnType<typeof cmsRecordToPublicProduct>>;

const DEMO_PRODUCTS: StoreProduct[] = [
  { id: "demo-travel-guide", slug: "demo-explore-africa", title: "Explore Africa Like an Insider", summary: "Practical tips, cultural insights and local know how for exploring more of Africa.", description: "A practical travel guide for exploring Africa with confidence.", imageUrl: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&q=85", imageAlt: "Mountain landscape overlooking an African travel route", productType: "Guide", category: "guides", availability: "coming-soon", externalUrl: "", currency: "GBP", price: 39, downloadReady: false, seoTitle: "", seoDescription: "", shareImageUrl: "", featured: false },
  { id: "demo-business-guide", slug: "demo-unwritten-rules", title: "The Unwritten Rules of Doing Business in Africa", summary: "What the guides leave out.", description: "A field guide to the context, relationships and decisions behind doing business across African markets.", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85", imageAlt: "Modern business district skyline", productType: "Guide", category: "guides", availability: "coming-soon", externalUrl: "", currency: "GBP", price: 49, downloadReady: false, seoTitle: "", seoDescription: "", shareImageUrl: "", featured: false },
  { id: "demo-pet-service", slug: "demo-pet-travel-consultation", title: "Pet Travel Consultation", summary: "A 20 minute call on moving your pet internationally.", description: "A 20 minute consultation to help you plan an international move with your pet.", imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85", imageAlt: "Two dogs outdoors", productType: "Service", category: "services", availability: "available", externalUrl: "", currency: "GBP", price: 95, downloadReady: false, seoTitle: "", seoDescription: "", shareImageUrl: "", featured: false },
];

export default async function StoreCatalogue({ category }: Props) {
  const records = await getPublicCmsRecords("products");
  const cmsProducts = records.map(cmsRecordToPublicProduct).filter((item): item is StoreProduct => item !== null);
  const products = cmsProducts.length ? cmsProducts : process.env.NODE_ENV === "development" ? DEMO_PRODUCTS : [];
  const selected = parseStoreCategory(category);
  const selectedInfo = selected ? getStoreCategory(selected) : null;
  const visible = selected ? products.filter((product) => product.category === selected) : products;
  const availableCategories = STORE_CATEGORIES.filter((item) => products.some((product) => product.category === item.id));
  const formatter = (value: number, currency: string) => {
    try { return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value); }
    catch { return `${currency} ${value.toFixed(2)}`; }
  };

  return <div className="tap-store-page">
    <section className="tap-store-hero" aria-labelledby="tap-store-heading">
      <div className="tap-store-hero-copy">
        <p className="tap-store-eyebrow">THE AFRICA PLUG</p>
        <h1 id="tap-store-heading">THE STORE<span>.</span></h1>
        <p className="tap-store-hero-description">Guides and services for exploring, doing business<br className="store-copy-break" /> and investing across Africa.</p>
      </div>
    </section>

    <div className="tap-cat-wrap">
      <nav className="tap-cat-nav" aria-label="Store categories">
        <ul>
          <li><Link href="/store" scroll={false} className={`tap-cat-chip${!selected ? " is-active" : ""}`} aria-current={!selected ? "page" : undefined}>All</Link></li>
          {availableCategories.map((item) => <li key={item.id}><Link href={`/store?category=${item.id}`} scroll={false} className={`tap-cat-chip${selected === item.id ? " is-active" : ""}`} aria-current={selected === item.id ? "page" : undefined}>{item.label}</Link></li>)}
        </ul>
      </nav>
      {selectedInfo ? <p className="tap-cat-intro">{selectedInfo.blurb}</p> : null}
    </div>

    <section className="tap-store-catalogue" aria-label="The Africa Plug Store products">
      {visible.length ? <div className="store-product-grid">
        {visible.map((product) => {
          const type = getStoreCategory(product.category).singular;
          const isGuide = product.category === "guides";
          const available = product.availability === "available";
          return <article className="store-product-card" key={product.id}>
            <Link href={`/store/${product.slug}`} className="store-product-image-link" aria-label={`View ${product.title}`}>
              {product.imageUrl ? <img className="store-product-image" src={product.imageUrl} alt={product.imageAlt} /> : <div className="store-product-image store-product-image-placeholder" aria-hidden="true"><span>THE AFRICA PLUG</span><strong>{product.title}</strong></div>}
            </Link>
            <div className="store-product-copy">
              <p className="store-product-kicker">{type}{!available ? <><span aria-hidden="true"> · </span>COMING SOON</> : null}</p>
              <h2><Link href={`/store/${product.slug}`}>{product.title}</Link></h2>
              <p className="store-product-summary">{product.summary}</p>
              <div className="store-product-action">
                {available ? <>
                  <strong className="store-product-price">{formatter(product.price, product.currency)}</strong>
                  {isGuide
                    ? <Link className="store-product-cta" href={`/store/${product.slug}`}>BUY NOW <span aria-hidden="true">→</span></Link>
                    : <StoreEnquiryButton title={product.title} />}
                </> : <button className="store-product-cta store-product-coming-soon" type="button" disabled>COMING SOON</button>}
              </div>
            </div>
          </article>;
        })}
      </div> : <section className="store-empty-state"><p className="tap-store-eyebrow">THE AFRICA PLUG STORE</p><h2>{selectedInfo?.emptyTitle ?? "A considered collection is on its way."}</h2><p>Practical guides and services to help you explore, do business and invest across Africa.</p><Link href="/work-with-fk" className="store-secondary-cta">WORK WITH FK <span aria-hidden="true">→</span></Link></section>}
      <div className="store-more-guides"><p>Need more than a guide?</p><Link href="/work-with-fk">WORK WITH FK <span aria-hidden="true">→</span></Link></div>
    </section>
  </div>;
}
