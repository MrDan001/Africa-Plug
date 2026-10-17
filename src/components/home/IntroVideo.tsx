// FILE PATH: src/components/home/IntroVideo.tsx
"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube embed. Nothing is requested from YouTube until the visitor
 * presses play, and the privacy-enhanced (youtube-nocookie) domain is used.
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
    <button type="button" className="intro-video-poster" onClick={() => setPlaying(true)} aria-label="Play the introduction video">
      <span className="eyebrow">INTRODUCTION</span>
      <span className="intro-video-label">Meet FK. The Africa Plug, on the ground.</span>
      <span className="intro-video-play" aria-hidden="true">▶</span>
    </button>
  );
}