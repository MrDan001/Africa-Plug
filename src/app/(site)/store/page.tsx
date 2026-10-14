import type {Metadata} from "next";
import BookShelf from "@/components/store/BookShelf";
export const metadata:Metadata={title:"Bookstore",description:"Explore practical guides and workbooks from The Africa Plug."};
export default function StorePage(){return <BookShelf/>;}
