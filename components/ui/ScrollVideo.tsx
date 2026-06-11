"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePinnedScene } from "@/components/ui/PinnedScene";

/**
 * ScrollVideo — BRIEF §7.10
 * Scroll-scrubbed video backdrop: inside a PinnedScene, video playback is
 * locked to scroll progress (0→1 maps to the clip's duration), eased slightly
 * so scrubbing feels weighty rather than stuttery. Absolute-positioned;
 * place inside a `relative` stage and layer content above it.
 *
 * The `src` clip MUST be encoded all-intra for smooth seeking:
 *   ffmpeg -i in.mp4 -an -c:v libx264 -pix_fmt yuv420p -g 1 -crf 22 \
 *          -movflags +faststart out.mp4
 * Keep clips to one continuous shot, ~5–10 s.
 *
 * Fallback ladder: missing/unloadable `src` → the `poster` image with a
 * gentle scroll-driven zoom; prefers-reduced-motion → static poster. This
 * means the component ships safely with a placeholder poster and upgrades
 * itself the moment a real clip lands in /public.
 */

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotion() {
  return false;
}

export function ScrollVideo({
  src,
  poster,
  className = "",
}: {
  /** All-intra encoded clip; omit to run in poster-only placeholder mode. */
  src?: string;
  poster: string;
  className?: string;
}) {
  const ctx = usePinnedScene();
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const reducedLocal = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  const reduced = ctx?.reduced ?? reducedLocal;

  const videoMode = Boolean(src) && !videoFailed && !reduced;
  const progress = ctx?.progress;

  // Scrub loop — eases displayed time toward scroll progress every frame.
  useEffect(() => {
    if (reduced || !progress) return;
    let frame = 0;
    let shown = 0;

    const tick = () => {
      const target = progress.current;

      const video = videoRef.current;
      if (video && video.duration && Number.isFinite(video.duration)) {
        shown += (target * video.duration - shown) * 0.18;
        if (Math.abs(video.currentTime - shown) > 0.02) {
          video.currentTime = shown;
        }
      }

      // Poster placeholder gets a slow scroll-driven push-in so the pinned
      // act still breathes before real footage exists.
      const img = posterRef.current;
      if (img) {
        img.style.transform = `scale(${1.05 + target * 0.13})`;
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, progress, videoMode]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {videoMode ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={posterRef}
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scale(1.05)" }}
        />
      )}
    </div>
  );
}
