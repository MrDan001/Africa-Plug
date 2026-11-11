import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "The Africa Plug — Your connection to Africa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  // Use the same approved source image and crop as the website's BrandLogo component.
  const logoBytes = await readFile(
    join(process.cwd(), "public", "images", "the-africa-plug-logo.jpg"),
  );
  const logoSrc = `data:image/jpeg;base64,${logoBytes.toString("base64")}`;

  const sourceSize = 1254;
  const crop = { x: 266, y: 96, width: 721, height: 1055 };
  const logoHeight = 58;
  const logoWidth = (crop.width / crop.height) * logoHeight;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 76, background: "#f7f5f1", color: "#292a2c", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", height: 64 }}>
        <div style={{ width: logoWidth, height: logoHeight, position: "relative", overflow: "hidden", display: "flex", flex: "none", background: "#000" }}>
          <img
            src={logoSrc}
            alt="The Africa Plug"
            width={sourceSize}
            height={sourceSize}
            style={{
              position: "absolute",
              display: "block",
              height: "auto",
              width: `${(sourceSize / crop.width) * 100}%`,
              left: `${-(crop.x / crop.width) * 100}%`,
              top: `${-(crop.y / crop.height) * 100}%`,
            }}
          />
        </div>
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
