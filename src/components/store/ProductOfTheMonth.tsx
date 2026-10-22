// FILE PATH: src/components/store/ProductOfTheMonth.tsx
import { getPublicSiteSettings } from "@/lib/cms-bridge";
import "./product-of-the-month.css";

export const dynamic = "force-dynamic";

/** Renders only when the switch is on in Site & SEO settings and the record is complete. */
export default async function ProductOfTheMonth() {
  const settings = await getPublicSiteSettings();
  const product = settings.productOfMonth;
  if (!settings.enableProductOfMonth || !product) return null;
  const paragraphs = product.writeUp.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

  return (
    <section className={"tap-potm-wrap"} aria-labelledby="potm-heading">
      <div className={"tap-potm-card"}>
        {product.imageUrl ? (
          <div className={"tap-potm-media"}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} loading="lazy" />
          </div>
        ) : null}
        <div className={"tap-potm-body"}>
          <p className={"tap-potm-eyebrow"}>PRODUCT OF THE MONTH{product.monthLabel ? ` · ${product.monthLabel.toUpperCase()}` : ""}</p>
          <h2 id="potm-heading">{product.name}</h2>
          {product.partner ? <p className={"tap-potm-partner"}>From {product.partner}</p> : null}
          {paragraphs.map((paragraph, index) => <p className={"tap-potm-text"} key={index}>{paragraph}</p>)}
          {product.discountCode ? (
            <p className={"tap-potm-discount"}>
              <span>Discount code</span>
              <code>{product.discountCode}</code>
              {product.discountNote ? <small>{product.discountNote}</small> : null}
            </p>
          ) : null}
          <a className={"tap-potm-cta"} href={product.url} target="_blank" rel="sponsored noopener noreferrer">VIEW THE PRODUCT <span aria-hidden="true">↗</span></a>
          <p className={"tap-potm-disclosure"}>TAP may earn a commission.</p>
        </div>
      </div>
    </section>
  );
}