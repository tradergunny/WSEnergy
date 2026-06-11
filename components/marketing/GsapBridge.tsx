"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * GsapBridge — page-level glue. Keeps GSAP's ScrollTrigger in sync with the
 * site-wide Lenis smooth scroll (SmoothScroll exposes the live instance on
 * window.lenis). Without this, scrubbed timelines lag a frame behind the
 * eased scroll position. Mount once per page that uses ScrollTrigger.
 *
 * Polls briefly for window.lenis because mount order between the layout's
 * SmoothScroll and page content isn't guaranteed. No Lenis = no-op (reduced
 * motion skips Lenis entirely; ScrollTrigger then tracks native scroll).
 */
export function GsapBridge() {
  useEffect(() => {
    let lenis: Lenis | undefined;
    let frame = 0;
    let tries = 0;

    const attach = () => {
      lenis = (window as unknown as { lenis?: Lenis }).lenis;
      if (lenis) {
        lenis.on("scroll", ScrollTrigger.update);
      } else if (tries++ < 120) {
        frame = requestAnimationFrame(attach);
      }
    };
    attach();

    return () => {
      cancelAnimationFrame(frame);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, []);

  return null;
}
