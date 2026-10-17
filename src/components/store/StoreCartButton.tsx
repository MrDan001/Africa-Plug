"use client";
import {useEffect,useState} from "react";
import {changeStoreCartQuantity,formatGBP,readStoreCart,removeStoreCartItem,STORE_CART_EVENT,type StoreCartItem} from "./cart";
function BasketIcon(){return <svg viewBox="0 0 28 28" width="27" height="27" fill="none" aria-hidden="true"><path d="M4 10h20l-2.1 11.2a2 2 0 0 1-2 1.6H8.1a2 2 0 0 1-2-1.6L4 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="m9 10 5-6 5 6M10 14v5M14 14v5M18 14v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="8.5" cy="25" r="1.2" fill="currentColor"/><circle cx="19.5" cy="25" r="1.2" fill="currentColor"/></svg>}
export default function StoreCartButton(){
 const [items,setItems]=useState<StoreCartItem[]>([]);const [open,setOpen]=useState(false);const [checkingOut,setCheckingOut]=useState(false);const [checkoutError,setCheckoutError]=useState("");
 useEffect(()=>{const refresh=()=>setItems(readStoreCart());refresh();window.addEventListener(STORE_CART_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(STORE_CART_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
 useEffect(()=>{if(!open)return;const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false);};window.addEventListener("keydown",closeOnEscape);return()=>window.removeEventListener("keydown",closeOnEscape);},[open]);
 const quantity=items.reduce((sum,item)=>sum+item.quantity,0);const subtotal=items.reduce((sum,item)=>sum+item.price*item.quantity,0);
 async function beginCheckout(){
  setCheckingOut(true);setCheckoutError("");
  try{
   const response=await fetch("/api/store/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:items.map(item=>({slug:item.slug,quantity:item.quantity}))})});
   const result=await response.json() as {url?:string;error?:string};
   if(!response.ok||!result.url)throw new Error(result.error||"Checkout is temporarily unavailable.");
   window.location.assign(result.url);
  }catch(error){setCheckoutError(error instanceof Error?error.message:"Checkout is temporarily unavailable.");setCheckingOut(false);}
 }
 return <div className="tap-store-cart"><button type="button" className="tap-store-cart-trigger" aria-label={"Open shopping cart, "+quantity+(quantity===1?" item":" items")} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><BasketIcon/><span className="tap-store-cart-count">{quantity>99?"99+":quantity}</span></button>
 {open?<div className="tap-store-cart-overlay" onClick={()=>setOpen(false)}><section className="tap-store-cart-panel" role="dialog" aria-modal="true" aria-labelledby="tap-store-cart-title" onClick={(event)=>event.stopPropagation()}>
 <div className="tap-store-cart-heading"><div><p>THE AFRICA PLUG</p><h2 id="tap-store-cart-title">Your basket <span>({quantity})</span></h2></div><button type="button" className="tap-store-cart-close" onClick={()=>setOpen(false)} aria-label="Close shopping basket">×</button></div>
 {items.length===0?<div className="tap-store-cart-empty"><BasketIcon/><h3>Your basket is waiting.</h3><p>Add a TAP product and it will be kept here while you browse.</p><button type="button" className="tap-store-cart-continue" onClick={()=>setOpen(false)}>EXPLORE PRODUCTS</button></div>:<>
 <div className="tap-store-cart-items">{items.map((item)=><article className="tap-store-cart-item" key={item.slug}><div className={"tap-store-cart-mini-cover tap-store-cover--"+item.cover} aria-hidden="true"><span>THE<br/>AFRICA<br/>PLUG</span></div><div className="tap-store-cart-item-copy"><h3>{item.title}</h3><p>{formatGBP(item.price)} each</p><div className="tap-store-cart-quantity"><button type="button" aria-label={"Decrease quantity of "+item.title} onClick={()=>changeStoreCartQuantity(item.slug,item.quantity-1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={"Increase quantity of "+item.title} onClick={()=>changeStoreCartQuantity(item.slug,item.quantity+1)}>+</button><button type="button" className="tap-store-cart-remove" onClick={()=>removeStoreCartItem(item.slug)}>Remove</button></div></div><strong>{formatGBP(item.price*item.quantity)}</strong></article>)}</div>
 <div className="tap-store-cart-subtotal"><span>Subtotal</span><strong>{formatGBP(subtotal)}</strong></div>
 <p className="tap-store-cart-demo-note">Secure checkout is provided by Stripe. Prices are verified against the Store catalogue before payment.</p>
 {checkoutError?<p role="alert" style={{color:"#b42318",fontSize:13,lineHeight:1.5}}>{checkoutError}</p>:null}
 <button type="button" className="tap-store-cart-checkout" onClick={beginCheckout} disabled={checkingOut}>{checkingOut?"CONNECTING TO STRIPE…":"CONTINUE TO SECURE CHECKOUT"} <span aria-hidden="true">→</span></button>
 <button type="button" className="tap-store-cart-continue" onClick={()=>setOpen(false)}>CONTINUE BROWSING</button></>}
 </section></div>:null}
 </div>;
}
