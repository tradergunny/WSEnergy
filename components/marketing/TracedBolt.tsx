"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * TracedBolt — the WS Energy logomark as a monumental engraving.
 * The bolt from the logo, redrawn as a single-color knockout outline on the
 * forest canvas: a barely-there mist contour with one gold light perpetually
 * traveling its edge, doubled by a gaussian-blurred twin so the stroke reads
 * as emitted light. A hallmark being engraved, not a logo pasted on.
 *
 * Same dash-offset technique as the SafetyCircuit pulses so the homepage
 * speaks one motion language. pathLength is normalized to 1000, so the
 * relative -=1000 tween wraps seamlessly regardless of true perimeter.
 *
 * Reduced motion: the beam rests as a static lit segment near the top tip.
 */

/* Bolt outline traced from the WS logomark: bottom tip → left peak →
   joint notch → top tip → lower peak → joint notch → close. */
const BOLT = "M52,512 L148,216 L188,252 L300,8 L208,318 L160,270 Z";

const BEAM_DASH = "130 870";

export function TracedBolt() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) {
        // Rest state: the lit segment sits on the upper spike (the stretch
        // ending at the top tip, ~49% along the normalized outline).
        gsap.set(".wsbolt-beam", { strokeDashoffset: -426 });
        return;
      }
      gsap.to(".wsbolt-beam", {
        strokeDashoffset: "-=1000",
        duration: 9,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="w-full">
      <svg
        viewBox="0 0 340 520"
        fill="none"
        aria-hidden="true"
        className="w-full"
      >
        <defs>
          <filter id="wsbolt-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>

        {/* Engraved base contour */}
        <path
          d={BOLT}
          stroke="var(--color-mist-400)"
          strokeOpacity="0.16"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Traveling gold light + blurred glow twin */}
        <path
          d={BOLT}
          className="wsbolt-beam"
          pathLength={1000}
          stroke="var(--color-gold-500)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={BEAM_DASH}
          strokeDashoffset="0"
          opacity="0.5"
          filter="url(#wsbolt-blur)"
        />
        <path
          d={BOLT}
          className="wsbolt-beam"
          pathLength={1000}
          stroke="var(--color-gold-400)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={BEAM_DASH}
          strokeDashoffset="0"
        />
      </svg>
    </div>
  );
}
