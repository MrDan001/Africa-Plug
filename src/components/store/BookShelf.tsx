import styles from "./BookShelf.module.css";

const books = [
  { title: "The Africa Starter Guide", category: "FIELD GUIDE", price: "£19.00", description: "A practical starting point for understanding markets, people and opportunities across Africa.", cover: "starter", label: "START HERE" },
  { title: "Doing Business in Nigeria", category: "MARKET PLAYBOOK", price: "£14.00", description: "A grounded introduction to local business culture, market entry and building trusted relationships.", cover: "nigeria", label: "NIGERIA" },
  { title: "The Opportunity Mapping Workbook", category: "WORKBOOK", price: "£12.00", description: "A structured workbook to compare opportunities, ask sharper questions and spot missing information.", cover: "mapping", label: "WORKBOOK" },
  { title: "Partnerships That Work", category: "PRACTICAL GUIDE", price: "£15.00", description: "A guide to finding aligned partners, setting expectations and building relationships that last.", cover: "partners", label: "PARTNERSHIPS" },
  { title: "The African Market Research Toolkit", category: "TOOLKIT", price: "£17.00", description: "A practical toolkit for organising research, testing assumptions and evaluating market signals.", cover: "research", label: "RESEARCH" },
  { title: "Export Ready: A Starter Workbook", category: "WORKBOOK", price: "£13.00", description: "Work through the early questions around readiness, buyers, logistics and export planning.", cover: "export", label: "EXPORT" },
  { title: "The Deal Preparation Checklist", category: "CHECKLIST", price: "£9.00", description: "A clear checklist for preparing conversations, reviewing documents and tracking next steps.", cover: "deal", label: "DEAL DESK" },
  { title: "Understanding African Supply Chains", category: "FIELD NOTES", price: "£16.00", description: "Explore the questions to ask when assessing suppliers, routes, reliability and delivery risks.", cover: "supply", label: "SUPPLY CHAINS" },
  { title: "From Idea to Market: Africa Edition", category: "PRACTICAL GUIDE", price: "£15.00", description: "Turn an early idea into a more testable plan with customer, context and execution questions.", cover: "market", label: "MARKET ENTRY" },
  { title: "The Investor's First Questions", category: "FIELD GUIDE", price: "£18.00", description: "A prompt-led guide to due diligence conversations, risk questions and evidence to request.", cover: "investor", label: "INVESTMENT" },
];

export default function BookShelf() {
  return (
    <section className={styles.shelfSection} aria-labelledby="book-shelf-title">
      <div className={styles.shelfHeading}>
        <div>
          <p className={styles.eyebrow}>THE TAP BOOKSHELF</p>
          <h2 id="book-shelf-title">Good decisions start<br />with better context.</h2>
        </div>
        <p className={styles.shelfIntro}>Browse practical guides, playbooks and workbooks made to help you ask better questions and take your next step with more confidence.</p>
      </div>
      <p className={styles.demoNotice}>DEMO CATALOGUE · Titles, prices and descriptions are placeholders for layout review. Checkout is not connected yet.</p>
      <div className={styles.bookGrid}>
        {books.map((book, index) => (
          <article className={styles.bookCard} key={book.title}>
            <div className={`${styles.bookCover} ${styles[book.cover]}`}>
              <span className={styles.coverBrand}>THE AFRICA PLUG <i> / </i> BOOKS</span>
              <span className={styles.coverIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.coverLabel}>{book.label}</span>
              <h3>{book.title}</h3>
              <span className={styles.coverRule} />
              <span className={styles.coverFooter}>PRACTICAL KNOWLEDGE FOR REAL-WORLD MOVES</span>
            </div>
            <div className={styles.bookDetails}>
              <p className={styles.bookCategory}>{book.category}</p>
              <h3>{book.title}</h3>
              <p className={styles.bookDescription}>{book.description}</p>
              <div className={styles.bookPurchase}>
                <strong>{book.price}</strong>
                <a href={`mailto:connect@theafricaplug.com?subject=${encodeURIComponent("Book purchase enquiry: " + book.title)}&body=${encodeURIComponent("Hello The Africa Plug, I'm interested in: " + book.title + " (" + book.price + "). Please let me know when checkout is available.")}`} aria-label={`Enquire about buying ${book.title}`}>Pay <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className={styles.shelfFootnote}>The Pay buttons are enquiry placeholders for this demo. No payment will be taken until secure checkout is connected.</p>
    </section>
  );
}
