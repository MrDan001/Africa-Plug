import Link from "next/link";
import MobileMenu from "./MobileMenu";

const NAV_ITEMS = [
  { label: "TAP IN", href: "/tap-in" },
  { label: "WORK WITH FK", href: "/work-with-fk" },
  { label: "STORE", href: "/store" },
  { label: "BLOG", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
  { label: "ABOUT", href: "/about" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-navy/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:h-20 lg:px-8">
        <Link href="/" aria-label="The Africa Plug, home" className="shrink-0">
          {/* Supplied logo file, used exactly as provided. Add it at public/images/logo.svg */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt="The Africa Plug"
            className="h-9 w-auto lg:h-11"
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm font-semibold tracking-wider">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/90 transition-colors hover:text-signal"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/tap-in"
            aria-label="Search"
            className="p-2 text-white"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" strokeLinecap="round" />
            </svg>
          </Link>
          <MobileMenu items={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}