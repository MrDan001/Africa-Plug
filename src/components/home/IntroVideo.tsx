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
        backgroundImage: "linear-gradient(180deg, rgba(0,0,0,.48), transparent 30%, transparent 70%, rgba(0,0,0,.38)), url('/images/work-with-fk-hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#ffffff",
      }}
    >
      <span className="intro-video-title"><b>Your Connection to Africa</b><small>The Africa Plug</small></span>
      <span className="intro-video-play" aria-hidden="true" style={{ color: "#ffffff" }}>▶</span>
      <span className="intro-video-youtube" aria-hidden="true">YouTube</span>
    </button>
  );
}
