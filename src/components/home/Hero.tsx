"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const BUTTONS = [
  { label: "Explore Africa", href: "/tap-in" },
  { label: "Work With FK", href: "/work-with-fk" },
  { label: "Ask The Africa Plug", href: "/contact" },
];

type Slide = {
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
  subhead: string;
  body: string;
  captionTitle: string;
  captionText: string;
  /** Which of the three buttons is solid pink on this slide */
  activeButton: number;
  imageDesktop: string;
  imageMobile: string;
};

// Slide 1 follows the reference. Slides 2 and 3 are placeholders until copy arrives.
const SLIDES: Slide[] = [
  {
    eyebrow: "THE AFRICA PLUG",
    lineOne: "KNOW WHAT'S",
    lineTwo: "MOVING.",
    subhead: "Business. Investment. Culture. Travel. Lifestyle. Opportunity.",
    body: "Follow the ideas, companies, conversations and opportunities shaping what happens next across the continent.",
    captionTitle: "Across Africa",
    captionText: "People. Capital. Opportunity.",
    activeButton: 0,
    imageDesktop: "/images/hero-1.jpg",
    imageMobile: "/images/mobile/hero-1.jpg",
  },
  {
    eyebrow: "WORK WITH FK",
    lineOne: "DEALS WORTH",
    lineTwo: "DOING.",
    subhead: "Strategy. Introductions. Execution.",
    body: "Placeholder copy for slide 2. Commercial deal consultancy for companies, investors and institutions working across Africa.",
    captionTitle: "Work With FK",
    captionText: "Commercial deal consultancy.",
    activeButton: 1,
    imageDesktop: "/images/hero-2.jpg",
    imageMobile: "/images/mobile/hero-2.jpg",
  },
  {
    eyebrow: "ASK THE AFRICA PLUG",
    lineOne: "GOT A",
    lineTwo: "QUESTION?",
    subhead: "Ask. Learn. Move.",
    body: "Placeholder copy for slide 3. Send your question and get a straight answer from The Africa Plug.",
    captionTitle: "Ask The Africa Plug",
    captionText: "Questions answered.",
    activeButton: 2,
    imageDesktop: "/images/hero-3.jpg",
    imageMobile: "/images/mobile/hero-3.jpg",
  },
];

const SLIDE_MS = 6500;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      SLIDE_MS
    );
    return () => window.clearTimeout(id);
  }, [index, paused]);

  const go = (next: number) =>
    setIndex((next + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-navy"
    >
      {/* Background photos, crossfading. Missing files simply show the navy base. */}
      {SLIDES.map((s, i) => (
        <div
          key={s.eyebrow}
          aria-hidden="true"
          style={
            {
              "--img-m": `url(${s.imageMobile})`,
              "--img-d": `url(${s.imageDesktop})`,
            } as React.CSSProperties
          }
          className={`absolute inset-0 bg-cover bg-center bg-[image:var(--img-m)] transition-opacity duration-1000 md:bg-[image:var(--img-d)] ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Gradient: heaviest on the left, dark at the top for the header */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(7,11,20,0.95) 0%, rgba(7,11,20,0.75) 45%, rgba(7,11,20,0.25) 100%), linear-gradient(to bottom, rgba(7,11,20,0.9) 0%, rgba(7,11,20,0) 25%)",
        }}
      />

      <div
        key={index}
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${SLIDES.length}`}
        aria-live={paused ? "polite" : "off"}
        className="hero-in relative mx-auto w-full max-w-7xl px-5 pb-32 pt-28 lg:px-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white">
          {slide.eyebrow}
        </p>

        <h1 className="mt-5 text-[clamp(2.75rem,12vw,7.5rem)] font-black uppercase leading-[0.9] tracking-tighter">
          <span className="block text-white">{slide.lineOne}</span>
          <span className="block text-signal">{slide.lineTwo}</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base font-semibold text-white md:text-xl">
          {slide.subhead}
        </p>
        <p className="mt-3 max-w-xl text-sm text-white/80 md:text-base">
          {slide.body}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {BUTTONS.map((button, i) => (
            <Link
              key={button.label}
              href={button.href}
              className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white transition-colors ${
                i === slide.activeButton
                  ? "border border-signal bg-signal hover:bg-white hover:text-navy hover:border-white"
                  : "border border-white hover:bg-white hover:text-navy"
              }`}
            >
              {button.label}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl items-end justify-between gap-4 px-5 pb-6 lg:px-8">
        <div>
          <p className="text-sm font-bold text-white">{slide.captionTitle}</p>
          <p className="text-xs text-white/70">{slide.captionText}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="p-2 text-white hover:text-signal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            {SLIDES.map((s, i) => (
              <button
                key={s.eyebrow}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className="group py-3"
              >
                <span
                  className={`block h-0.5 w-8 transition-colors sm:w-10 ${
                    i === index ? "bg-white" : "bg-white/30 group-hover:bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="p-2 text-white hover:text-signal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            aria-pressed={paused}
            className="ml-1 border border-white/60 p-2 text-white hover:border-signal hover:text-signal"
          >
            {paused ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4l13 8-13 8z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}