"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll — site-wide buttery scroll via Lenis (BRIEF §7.9).
 * Skipped automatically when the user prefers reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    // Expose the live instance so in-page anchor links can defer to Lenis
    // for on-brand smooth scrolling instead of fighting it with native scrollTo.
    (window as unknown as { lenis: Lenis }).lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return null;
}
