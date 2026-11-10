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

  function playVideo() {
    // Choosing to play this video is the visitor's explicit choice to load
    // embedded content. Save the same consent key used by CookieConsent.
    try {
      localStorage.setItem("tap-consent-v2", "embedded");
    } catch {
      // The video can still play when browser storage is unavailable.
    }
    window.dispatchEvent(new Event("tap:consent-changed"));
    setPlaying(true);
  }

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
      onClick={playVideo}
      aria-label="Play the introduction video"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, .42), transparent 34%, transparent 66%, rgba(0, 0, 0, .32)), url("https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg")`,
        backgroundColor: "#080808",
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        color: "#ffffff",
      }}
    >
      <span className="intro-video-title"><b>Your Connection to Africa</b><small>The Africa Plug</small></span>
      <span className="intro-video-play" aria-hidden="true" style={{ color: "#ffffff" }}>▶</span>
      <span className="intro-video-youtube" aria-hidden="true">YouTube</span>
    </button>
  );
}
