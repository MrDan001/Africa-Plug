// FILE PATH: src/components/layout/BrandLogo.tsx
// The official The Africa Plug logo. The image file is used exactly as supplied (public/images/the-africa-plug-logo.jpg);
// only the empty black border around it is hidden on screen so the logo can be shown at a readable size.
// Its background is pure black, so it blends into the black header and footer.

const FILE = 1254;                       // the image is 1254 x 1254
const CROP = { x: 266, y: 96, w: 721, h: 1055 }; // visible area (logo plus a small margin)

type Props = { height?: number; className?: string };

export default function BrandLogo({ height, className = "" }: Props) {
  return (
    <div
      className={("tap-brand-logo " + className).trim()}
      style={{ display: "inline-block", position: "relative", overflow: "hidden", flex: "none", background: "#000", aspectRatio: `${CROP.w} / ${CROP.h}`, ...(height ? { height } : {}) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/the-africa-plug-logo.jpg"
        alt="The Africa Plug"
        width={FILE}
        height={FILE}
        style={{ position: "absolute", display: "block", maxWidth: "none", borderRadius: 0, height: "auto", width: `${(FILE / CROP.w) * 100}%`, left: `${-(CROP.x / CROP.w) * 100}%`, top: `${-(CROP.y / CROP.h) * 100}%` }}
      />
    </div>
  );
}