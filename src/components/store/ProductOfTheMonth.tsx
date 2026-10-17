// FILE PATH: src/components/store/ProductOfTheMonth.tsx
import { getPublicSiteSettings } from "@/lib/cms-bridge";
import styles from "./ProductOfTheMonth.module.css";

export const dynamic = "force-dynamic";

/** Renders only when the switch is on in Site & SEO settings and the record is complete. */
export default async function ProductOfTheMonth() {
  const settings = await getPublicSiteSettings();
  const product = settings.productOfMonth;
  if (!settings.enableProductOfMonth || !product) return null;
  const paragraphs = product.writeUp.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

  return (
    <section className={styles.wrap} aria-labelledby="potm-heading">
      <div className={styles.card}>
        {product.imageUrl ? (
          <div className={styles.media}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} loading="lazy" />
          </div>
        ) : null}
        <div className={styles.body}>
          <p className={styles.eyebrow}>PRODUCT OF THE MONTH{product.monthLabel ? ` · ${product.monthLabel.toUpperCase()}` : ""}</p>
          <h2 id="potm-heading">{product.name}</h2>
          {product.partner ? <p className={styles.partner}>From {product.partner}</p> : null}
          {paragraphs.map((paragraph, index) => <p className={styles.text} key={index}>{paragraph}</p>)}
          {product.discountCode ? (
            <p className={styles.discount}>
              <span>Discount code</span>
              <code>{product.discountCode}</code>
              {product.discountNote ? <small>{product.discountNote}</small> : null}
            </p>
          ) : null}
          <a className={styles.cta} href={product.url} target="_blank" rel="sponsored noopener noreferrer">VIEW THE PRODUCT <span aria-hidden="true">↗</span></a>
          <p className={styles.disclosure}>TAP may earn a commission.</p>
        </div>
      </div>
    </section>
  );
}
