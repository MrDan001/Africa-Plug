import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";

export default function NotFound() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-signal focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Header />
      <main
        id="main"
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          minHeight: "58vh",
          padding: "150px 24px 82px",
          background: "#f8f6f2",
          color: "#292a2c",
          textAlign: "center",
        }}
      >
        <section style={{ width: "min(100%, 760px)", margin: "0 auto" }}>
          <p style={{ margin: "0 0 22px", color: "#d51f6d", fontSize: 10, fontWeight: 850, letterSpacing: ".28em" }}>
            THE AFRICA PLUG · PAGE NOT FOUND
          </p>
          <p
            aria-hidden="true"
            style={{
              margin: "0 0 28px",
              color: "#d51f6d",
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "clamp(112px, 24vw, 220px)",
              fontWeight: 700,
              lineHeight: .76,
              letterSpacing: "-.09em",
            }}
          >
            404
          </p>
          <h1 style={{ margin: "0 auto 16px", maxWidth: 650, color: "#191919", fontFamily: 'Georgia, "Times New Roman", serif', fontSize: "clamp(30px, 5vw, 54px)", lineHeight: 1.02, letterSpacing: "-.045em" }}>
            THIS PAGE ISN’T HERE.
          </h1>
          <p style={{ maxWidth: 480, margin: "0 auto 28px", color: "#66615b", fontSize: 15, lineHeight: 1.7 }}>
            The link may be incorrect or the page may have moved. Head back to The Africa Plug homepage and find your way from there.
          </p>
          <Link href="/#top" className="button button-pink">
            BACK TO HOMEPAGE <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}
