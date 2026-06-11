"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * CountUp — BRIEF §7.10
 * Animates a number from 0 to `to` the first time it scrolls into view.
 * Drop into a StatBlock `value` slot: <CountUp to={500} suffix="MW+" />.
 *
 * SSR renders the final value (SEO + no-JS correct); tabular-nums keeps the
 * layout from wobbling mid-count. Static under prefers-reduced-motion.
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => `${prefix}${n.toLocaleString("en-US")}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const state = { v: 0 };
      el.textContent = format(0);
      gsap.to(state, {
        v: to,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = format(Math.round(state.v));
        },
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {format(to)}
    </span>
  );
}
