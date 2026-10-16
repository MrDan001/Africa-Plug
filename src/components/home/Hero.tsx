"use client";

import { useEffect, useState } from "react";

const BUTTONS = [
  { label: "WORK WITH FK", href: "#work-with-fk" },
  { label: "TAP IN", href: "#tap-in" },
  { label: "ASK THE AFRICA PLUG", href: "#contact" },
];

type Slide = {
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
  body: string;
  captionTitle: string;
  captionText: string;
  activeButton: number;
  image: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "AFRICA'S OPPORTUNITIES. REAL PEOPLE. LASTING IMPACT.",
    lineOne: "BUSINESS. INVESTMENT.",
    lineTwo: "REAL OPPORTUNITY.",
    body: "The Africa Plug connects ambitious people and businesses to real opportunities across Africa.",
    captionTitle: "Across Africa",
    captionText: "People. Capital. Opportunity.",
    activeButton: 0,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2400&q=88",
  },
  {
    eyebrow: "LIVE OPPORTUNITIES ACROSS AFRICA",
    lineOne: "FIND THE",
    lineTwo: "RIGHT OPENING.",
    body: "From agriculture to infrastructure, discover real opportunities worth your attention.",
    captionTitle: "TAP IN",
    captionText: "Discover. Connect. Act.",
    activeButton: 1,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=88",
  },
  {
    eyebrow: "COMMERCIAL DEAL CONSULTANCY",
    lineOne: "GOOD DEALS",
    lineTwo: "MOVE PEOPLE.",
    body: "Practical commercial support, thoughtful introductions and a clearer route from interest to action.",
    captionTitle: "Work With FK",
    captionText: "Simple. Clear. Focused.",
    activeButton: 2,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=88",
  },
];

const SLIDE_MS = 6500;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [customImages, setCustomImages] = useState<(string | null)[]>([null, null, null]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused]);

  useEffect(() => {
    let active = true;
    async function loadCustomImages() {
      try {
        const response = await fetch("/api/hero-images", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as { images?: (string | null)[] };
        if (active && Array.isArray(data.images)) {
          setCustomImages([data.images[0] ?? null, data.images[1] ?? null, data.images[2] ?? null]);
        }
      } catch {
        // Keep the built-in images if custom image storage is not configured or available.
      }
    }
    void loadCustomImages();
    return () => { active = false; };
  }, []);

  const displaySlides = SLIDES.map((item, i) => ({
    ...item,
    image: customImages[i] || item.image,
  }));
  const slide = displaySlides[index];
  const go = (next: number) => setIndex((next + SLIDES.length) % SLIDES.length);

  return (
    <section id="top" className="hero" aria-roledescription="carousel" aria-label="Featured opportunities">
      {displaySlides.map((item, i) => (
        <div
          key={item.eyebrow}
          aria-hidden="true"
          className={`hero-photo ${i === index ? "is-active" : ""}`}
          style={{ backgroundImage: `url("${item.image}")` }}
        />
      ))}
      <div className="hero-shade" aria-hidden="true" />
      <div key={index} className="hero-content hero-in" role="group" aria-roledescription="slide" aria-label={`Slide ${index + 1} of ${SLIDES.length}`}>
        <p className="eyebrow hero-eyebrow">{slide.eyebrow}</p>
        <h1><span>{slide.lineOne}</span><span className="pink-text">{slide.lineTwo}</span></h1>
        <p className="hero-copy">{slide.body}</p>
        <div className="hero-actions">
          {BUTTONS.map((button, i) => (
            <a key={button.label} href={button.href} className={`button ${i === slide.activeButton ? "button-pink" : "button-outline"}`}>
              {button.label}<span aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </div>

    </section>
  );
}
