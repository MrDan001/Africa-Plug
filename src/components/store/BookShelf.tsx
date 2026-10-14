import { books, payEnquiryHref, slugify } from "./books";

export default function BookShelf() {
  return (
    <section className="tap-shelf-section tap-bookshelf" aria-labelledby="book-shelf-title">
      <div className="tap-shelf-heading tap-bookshelf-heading">
        <div>
          <p className="tap-shelf-eyebrow">THE TAP BOOKSHELF</p>
          <h2 id="book-shelf-title">Find the right guide for your next move.</h2>
        </div>
        <p className="tap-shelf-intro">Pick a cover to explore the full description, what is inside and the price. The titles below are demonstration products.</p>
      </div>
      <div className="tap-shelf-notice tap-bookshelf-notice" role="note">
        <span className="tap-shelf-notice-mark" aria-hidden="true">i</span>
        <p><strong>Demo store.</strong> Titles, prices and descriptions are placeholders. Pay opens an email enquiry; secure online checkout is not connected, and no payment is taken here.</p>
      </div>
      <div className="tap-shelf-grid tap-bookshelf-grid">
        {books.map((book, index) => {
          const slug = slugify(book.title);
          return (
            <article className="tap-book-card tap-book-product" key={book.title} id={`book-${slug}`}>
              <div className="tap-book-display">
                <a className={`tap-book-cover tap-book-cover--${book.cover}`} href={`/store/${slug}`} aria-label={`View details for ${book.title}`}>
                  <span className="tap-book-cover-brand">THE AFRICA PLUG <i>/</i> BOOKS</span>
                  <span className="tap-book-cover-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="tap-book-cover-label">{book.label}</span>
                  <h3>{book.title}</h3>
                  <span className="tap-book-cover-rule" />
                  <span className="tap-book-cover-footer">PRACTICAL KNOWLEDGE FOR REAL-WORLD MOVES</span>
                </a>
                <span className="tap-bookshelf-wood-edge" aria-hidden="true" />
              </div>
              <div className="tap-book-details">
                <p className="tap-book-category">{book.category}</p>
                <h3><a href={`/store/${slug}`}>{book.title}</a></h3>
                <p className="tap-book-description">{book.description}</p>
                <div className="tap-book-purchase">
                  <strong>{book.price}</strong>
                  <a className="tap-book-details-link" href={`/store/${slug}`}>Details <span aria-hidden="true">↗</span></a>
                  <a className="tap-book-pay-link" href={payEnquiryHref(book)} aria-label={`Enquire about paying for ${book.title}`}>Pay <span aria-hidden="true">→</span></a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="tap-shelf-footnote tap-bookshelf-footnote">Product names, content and prices must be confirmed before launch. No card or bank details are requested on this demo page.</p>
    </section>
  );
}
