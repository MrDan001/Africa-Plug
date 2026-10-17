// FILE PATH: src/components/home/IntroVideo.tsx
"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube embed with an immediate background preview thumbnail.
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
        position: "relative",
        overflow: "hidden",
        border: 0,
        cursor: "pointer",
        padding: 0,
      }}
    >
      {/* Background image & gradient overlay layer */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(233, 229, 223, 0.72), rgba(233, 229, 223, 0.88)), url('https://img.youtube.com/vi/${videoId}/hqdefault.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 1,
        }} 
      />
      
      {/* Content layer stacked safely above the background */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", width: "100%", padding: "clamp(20px,4vw,48px)", textAlign: "left" }}>
        <span className="eyebrow">INTRODUCTION</span>
        <span className="intro-video-label">Meet FK. The Africa Plug, on the ground.</span>
        <span className="intro-video-play" aria-hidden="true" style={{ position: "absolute", right: 24, bottom: 24 }}>▶</span>
      </div>
    </button>
  );
}