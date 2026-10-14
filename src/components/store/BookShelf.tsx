import Link from "next/link";
import {books,slugify} from "./books";
import StoreAddToCartButton from "./StoreAddToCartButton";
function BookIcon(){return <svg viewBox="0 0 40 40" width="39" height="39" fill="none" aria-hidden="true"><path d="M5 8.5c5-2 10-1.4 15 2v22c-5-3.4-10-4-15-2v-22ZM35 8.5c-5-2-10-1.4-15 2v22c5-3.4 10-4 15-2v-22Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 13h7M9 17h7M24 13h7M24 17h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
function BookCard({book,index}:{book:(typeof books)[number];index:number}){
 const slug=slugify(book.title);
 return <article className="tap-store-product" id={"book-"+slug}>
 <Link className="tap-store-product-cover-link" href={"/store/"+slug} aria-label={"View "+book.title+" details"}><div className={"tap-store-cover tap-store-cover--"+book.cover}><span className="tap-store-cover-brand">THE AFRICA PLUG</span><span className="tap-store-cover-number">{String(index+1).padStart(2,"0")}</span><span className="tap-store-cover-kicker">{book.label}</span><h3>{book.title}</h3><span className="tap-store-cover-mark" aria-hidden="true"/><span className="tap-store-cover-footer">PRACTICAL KNOWLEDGE<br/>FOR REAL-WORLD MOVES</span></div></Link>
 <div className="tap-store-shelf-plank" aria-hidden="true"/>
 <div className="tap-store-product-info"><Link href={"/store/"+slug} className="tap-store-product-title">{book.title}</Link><p className="tap-store-product-price">{book.price}</p><div className="tap-store-product-actions"><Link className="tap-store-details-button" href={"/store/"+slug}>VIEW DETAILS <span aria-hidden="true">→</span></Link><StoreAddToCartButton compact slug={slug} title={book.title} price={book.price} cover={book.cover}/></div></div></article>;
}
export default function BookShelf(){
 const shelves=[books.slice(0,5),books.slice(5,10)];
 return <div className="tap-store-page">
 <section className="tap-store-hero" aria-labelledby="tap-store-heading"><div className="tap-store-hero-copy"><p className="tap-store-eyebrow">THE AFRICA PLUG</p><h1 id="tap-store-heading">BOOKSTORE</h1><p className="tap-store-hero-description">Practical guides, real stories and valuable insights<br className="tap-store-desktop-break"/> for a bigger, bolder future.</p></div><aside className="tap-store-hero-aside"><BookIcon/><p>Better decisions.<br/>Bigger opportunities.<br/>A stronger you.</p></aside></section>
 <section className="tap-store-catalogue" aria-label="Africa Plug books"><div className="tap-store-shelves-frame">{shelves.map((shelf,shelfIndex)=><div className="tap-store-shelf-row" key={shelfIndex}>{shelf.map((book,index)=><BookCard key={book.title} book={book} index={shelfIndex*5+index}/>)}</div>)}</div></section>
 <section className="tap-store-benefits" aria-label="What the bookshelf offers">
 <div className="tap-store-benefit"><span className="tap-store-benefit-icon" aria-hidden="true"><BookIcon/></span><div><h2>PRACTICAL GUIDANCE</h2><p>Tools for clearer decisions.</p></div></div>
 <div className="tap-store-benefit"><span className="tap-store-benefit-icon" aria-hidden="true"><svg viewBox="0 0 32 32" width="31" height="31" fill="none"><path d="M16 3 27 7v8c0 7-4.7 11.7-11 14C9.7 26.7 5 22 5 15V7l11-4Z" stroke="currentColor" strokeWidth="1.7"/><path d="m11 16 3.3 3.3L21 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></span><div><h2>AFRICA-FOCUSED CONTEXT</h2><p>Useful questions to ask.</p></div></div>
 <div className="tap-store-benefit"><span className="tap-store-benefit-icon" aria-hidden="true"><svg viewBox="0 0 32 32" width="31" height="31" fill="none"><path d="M4 7h24v19H4zM9 12h14M9 17h10M9 22h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></span><div><h2>KNOW WHAT'S INSIDE</h2><p>Read each book's details.</p></div></div>
 <div className="tap-store-benefit"><span className="tap-store-benefit-icon" aria-hidden="true"><svg viewBox="0 0 32 32" width="31" height="31" fill="none"><path d="M4 25V7m0 18h24M8 21l6-7 5 4 8-11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 7h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></span><div><h2>BUILT FOR NEXT STEPS</h2><p>From interest to informed action.</p></div></div>
 </section><p className="tap-store-demo-note">Demo catalogue: titles and prices are placeholders. The cart can collect selections, but online checkout and digital delivery are not connected yet.</p></div>;
}
