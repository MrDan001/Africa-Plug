// FILE PATH: src/components/home/IntroVideo.tsx
"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube embed. Clicking the play control is the visitor's
 * choice to load this video, so it opens directly in privacy-enhanced mode
 * without forcing the visitor into cookie settings first.
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
        backgroundImage: "linear-gradient(135deg, rgba(8, 8, 8, .96), rgba(50, 12, 34, .90))",
        backgroundColor: "#080808",
        color: "#ffffff",
      }}
    >
      <span className="intro-video-title"><b>Your Connection to Africa</b><small>The Africa Plug</small></span>
      <span className="intro-video-play" aria-hidden="true" style={{ color: "#ffffff" }}>▶</span>
      <span className="intro-video-youtube" aria-hidden="true">YouTube</span>
    </button>
  );
}
