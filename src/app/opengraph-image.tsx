import { ImageResponse } from "next/og";

export const alt = "The Africa Plug logo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const logoUrl = new URL(
    "/images/the-africa-plug-logo.jpg",
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://theafricaplug.com",
  ).toString();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
      }}
    >
      <div
        style={{
          width: 380,
          height: 556,
          position: "relative",
          overflow: "hidden",
          background: "#000000",
          aspectRatio: "721 / 1055",
        }}
      >
        <img
          src={logoUrl}
          width={1254}
          height={1254}
          style={{
            position: "absolute",
            display: "block",
            maxWidth: "none",
            height: "auto",
            width: `${(1254 / 721) * 100}%`,
            left: `${-(266 / 721) * 100}%`,
            top: `${-(96 / 1055) * 100}%`,
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
