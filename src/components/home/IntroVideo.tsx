// FILE PATH: src/components/home/IntroVideo.tsx
"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube embed with an immediate visual preview thumbnail.
 * Nothing heavy is requested from YouTube until the visitor presses play.
 */
export default function IntroVideo({ videoId }: { videoId: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="intro-video-frame"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1`}
        title="The Africa Plug introduction video"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <button 
      type="button" 
      className="intro-video-poster" 
      onClick={() => setPlaying(true)} 
      aria-label="Play the introduction video"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.80)), url('https://img.youtube.com/vi/${videoId}/hqdefault.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#ffffff",
      }}
    >
      {/* Keeping "INTRODUCTION" explicitly pink */}
      <span className="eyebrow" style={{ color: "#db2777", fontWeight: "bold" }}>INTRODUCTION</span>
      <span className="intro-video-label" style={{ color: "#ffffff" }}>Meet FK. The Africa Plug, on the ground.</span>
      <span className="intro-video-play" aria-hidden="true" style={{ color: "#ffffff" }}>▶</span>
    </button>
  );
}