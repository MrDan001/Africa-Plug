import { ImageResponse } from "next/og";
import logo from "../../public/images/the-africa-plug-logo.jpg";

export const alt = "The Africa Plug — Your connection to Africa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 76, background: "#f7f5f1", color: "#292a2c", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", height: 58 }}>
        <img
          src={logo.src}
          width={logo.width}
          height={logo.height}
          style={{
            display: "block",
            width: 250,
            height: 58,
            objectFit: "contain",
            objectPosition: "left center",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
        <div style={{ width: 68, height: 5, background: "#d51f6d", marginBottom: 26 }} />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 58, fontWeight: 900, letterSpacing: -2.5, lineHeight: 1.02 }}>YOUR CONNECTION<br />TO AFRICA.</div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 22, color: "#626469", letterSpacing: 1, fontWeight: 700 }}>INVESTMENT <span style={{ color: "#d51f6d", margin: "0 13px" }}>•</span> BUSINESS <span style={{ color: "#d51f6d", margin: "0 13px" }}>•</span> ENTERTAINMENT</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #d6d0c7", paddingTop: 20, color: "#626469", fontSize: 16 }}>
        <span>THE AFRICA PLUG</span><span>THEAFRICAPLUG.COM</span>
      </div>
    </div>,
    { ...size }
  );
}
