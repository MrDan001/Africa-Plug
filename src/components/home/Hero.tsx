// FILE PATH: src/components/home/Hero.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import "./hero-brief.css";

const BUTTONS = [
  { label: "WORK WITH FK", href: "#work-with-fk" },
  { label: "TAP IN", href: "#tap-in" },
  { label: "ASK THE AFRICA PLUG", href: "/contact?type=ask" },
];

type Slide = {
  line1: string;
  line2: string;
  highlight: string;
  support: string;
  activeButton: number;
  image: string;
  mobileImage?: string | null;
  location: string;
};

const SLIDES: Slide[] = [
  {
    line1: "I'M BUILDING",
    line2: "BUSINESS IN AFRICA.",
    highlight: "BUSINESS",
    support: "For businesses entering, expanding or already operating in Africa.",
    activeButton: 0,
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2400&q=88",
    location: "Lagos, Nigeria",
  },
  {
    line1: "I'M LOOKING FOR AN",
    line2: "OPPORTUNITY.",
    highlight: "OPPORTUNITY",
    support: "Active business and investment opportunities you can take part in.",
    activeButton: 1,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=88",
    location: "Across Africa",
  },
  {
    line1: "I HAVE A",
    line2: "QUESTION.",
    highlight: "QUESTION",
    support: "Trying to understand a market, place, issue or opportunity in Africa?",
    activeButton: 2,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=88",
    location: "On the ground in Africa",
  },
];

function Headline({ text, highlight }: { text: string; highlight: string }) {
  const at = text.indexOf(highlight);
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<em>{highlight}</em>{text.slice(at + highlight.length)}</>;
}

const SLIDE_MS = 6500;

export default function Hero({ initialImages = [null, null, null], initialMobileImages = [null, null, null] }: { initialImages?: (string | null)[]; initialMobileImages?: (string | null)[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [customImages, setCustomImages] = useState<(string | null)[]>(initialImages);
  const [customMobileImages, setCustomMobileImages] = useState<(string | null)[]>(initialMobileImages);
  const carouselRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || hovered || reducedMotion) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, hovered, reducedMotion]);

  useEffect(() => {
    let active = true;
    async function loadCustomImages() {
      try {
        const response = await fetch("/api/hero-images", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as { images?: (string | null)[]; mobileImages?: (string | null)[] };
        if (active && Array.isArray(data.images)) {
          setCustomImages([data.images[0] ?? null, data.images[1] ?? null, data.images[2] ?? null]);
          if (Array.isArray(data.mobileImages)) setCustomMobileImages([data.mobileImages[0] ?? null, data.mobileImages[1] ?? null, data.mobileImages[2] ?? null]);
        }
      } catch {
        // Keep the existing image defaults if admin-managed images are unavailable.
      }
    }
    void loadCustomImages();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!carouselRef.current?.contains(document.activeElement)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => (current + 1) % SLIDES.length);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displaySlides = SLIDES.map((item, i) => ({
    ...item,
    image: customImages[i] || item.image,
    mobileImage: customMobileImages[i] || customImages[i] || item.image,
  }));
  const slide = displaySlides[index];
  const go = (next: number) => setIndex((next + SLIDES.length) % SLIDES.length);

  return (
    <section
      ref={carouselRef}
      id="top"
      className="hero hero-brief"
      aria-roledescription="carousel"
      aria-label="Where do you want to plug in?"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {displaySlides.map((item, i) => (
        <div
          key={item.line1}
          aria-hidden="true"
          className={`hero-photo ${i === index ? "is-active" : ""} hero-photo-slide-${i + 1}`}
          style={{ backgroundImage: `url("${item.image}")`, "--hero-mobile-image": `url("${item.mobileImage || item.image}")` } as React.CSSProperties & { "--hero-mobile-image": string }}
        />
      ))}
      <div className="hero-shade" aria-hidden="true" />
      <div key={index} className="hero-content hero-in" role="group" aria-roledescription="slide" aria-label={`Slide ${index + 1} of ${SLIDES.length}`}>
        <h1>
          <span><Headline text={slide.line1} highlight={slide.highlight} /></span>
          <span><Headline text={slide.line2} highlight={slide.highlight} /></span>
        </h1>
        <p className="hero-support">{slide.support}</p>
        <p className="hero-brandline">THE AFRICA PLUG — YOUR CONNECTION TO AFRICA</p>
        <p className="hero-categories">Investment <span aria-hidden="true">•</span> Business <span aria-hidden="true">•</span> Entertainment</p>
        <p className="hero-question">Where do you want to plug in?</p>
        <div className="hero-actions" aria-label="Choose a route">
          {BUTTONS.map((button, i) => (
            <a
              key={button.label}
              href={button.href}
              aria-current={i === slide.activeButton ? "page" : undefined}
              className={`button ${i === slide.activeButton ? "button-pink" : "button-outline"}`}
            >
              {button.label}<span aria-hidden="true">→</span>
            </a>
          ))}
        </div>
        <p className="hero-location">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="9.5" r="2.4" fill="currentColor" /></svg>
          {slide.location}
        </p>
      </div>
      <div className="hero-brief-controls" role="group" aria-label="Carousel controls">
        <button type="button" className="hero-brief-arrow" onClick={() => go(index - 1)} aria-label="Previous slide">←</button>
        {SLIDES.map((item, i) => (
          <button
            key={item.line1}
            type="button"
            className={`hero-brief-dot${i === index ? " is-active" : ""}`}
            onClick={() => go(i)}
            aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
            aria-current={i === index ? "true" : undefined}
          />
        ))}
        <button type="button" className="hero-brief-arrow" onClick={() => go(index + 1)} aria-label="Next slide">→</button>
        <button
          type="button"
          className="hero-brief-pause"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? "Play carousel" : "Pause carousel"}
        >
          {paused ? "▶" : "❚❚"}
        </button>
      </div>
    </section>
  );
}