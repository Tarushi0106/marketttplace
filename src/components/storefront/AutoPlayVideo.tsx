"use client";

import { useEffect, useRef } from "react";

interface AutoPlayVideoProps {
  src: string;
  className?: string;
  controls?: boolean;
}

// Plain <video autoPlay> is sometimes ignored by the browser (blocked autoplay,
// or the element getting hot-reloaded without a fresh play() call). Forcing
// play() explicitly from an effect makes it reliable everywhere.
export function AutoPlayVideo({ src, className, controls = false }: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay was blocked — leave the poster frame showing rather than throw.
      });
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      controls={controls}
    />
  );
}
