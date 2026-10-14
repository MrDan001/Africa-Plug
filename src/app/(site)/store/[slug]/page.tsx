import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {books,payEnquiryHref,slugify} from "@/components/store/books";
import StoreAddToCartButton from "@/components/store/StoreAddToCartButton";
type PageProps={params:Promise<{slug:string}>};
export function generateStaticParams(){return books.map((book)=>({slug:slugify(book.title)}));}
export async function generateMetadata({params}:PageProps):Promise<Metadata>{const {slug}=await params;const book=books.find((item)=>slugify(item.title)===slug);if(!book)return {title:"Book not found | The Africa Plug"};return {title:book.title+" | The Africa Plug Bookshelf",description:book.description};}
export default async function BookDetailPage({params}:PageProps){
 const {slug}=await params;const book=books.find((item)=>slugify(item.title)===slug);if(!book)notFound();
 const bookNumber=String(books.findIndex((item)=>item.title===book.title)+1).padStart(2,"0");
 return <div className="tap-product-detail-page"><div className="tap-product-detail-topline"><a href="/store">← Back to the bookshelf</a><span>THE AFRICA PLUG / BOOKS</span></div>
 <section className="tap-product-detail-layout" aria-labelledby="tap-product-title"><div className="tap-product-detail-art"><div className={"tap-book-cover tap-book-cover--"+book.cover+" tap-detail-book-cover"}><span className="tap-book-cover-brand">THE AFRICA PLUG <i>/</i> BOOKS</span><span className="tap-book-cover-index">{bookNumber}</span><span className="tap-book-cover-label">{book.label}</span><h2>{book.title}</h2><span className="tap-book-cover-rule"/><span className="tap-book-cover-footer">PRACTICAL KNOWLEDGE FOR REAL-WORLD MOVES</span></div><div className="tap-product-detail-art-caption">A practical resource from The Africa Plug.</div></div>
 <div className="tap-product-detail-copy"><p className="tap-book-category">{book.category}</p><h1 id="tap-product-title">{book.title}</h1><p className="tap-product-detail-summary">{book.description}</p><div className="tap-product-detail-price-row"><span className="tap-product-detail-price">{book.price}</span><span className="tap-product-demo-tag">DEMO PRICE</span></div>
 <div className="tap-product-detail-actions"><StoreAddToCartButton slug={slug} title={book.title} price={book.price} cover={book.cover}/><a className="tap-product-back-link" href={payEnquiryHref(book)}>ENQUIRE BY EMAIL</a><a className="tap-product-back-link" href="/store">BROWSE ALL BOOKS</a></div>
 <p className="tap-product-checkout-note">This is a demonstration listing. The cart stores your selection in this browser, but secure checkout and digital delivery are not connected yet.</p>
 <div className="tap-product-detail-description"><h2>About this book</h2>{book.fullDescription.map((paragraph)=><p key={paragraph}>{paragraph}</p>)}<h2>What you’ll work through</h2><ul>{book.includes.map((item)=><li key={item}>{item}</li>)}</ul></div></div></section></div>;
}
