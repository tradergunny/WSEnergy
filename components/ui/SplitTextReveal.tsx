"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * SplitTextReveal — BRIEF §7.10
 * Headline reveal: text splits into masked lines and the words rise into
 * view with a stagger, once, when the element enters the viewport. Use for
 * section headlines in place of wrapping the heading in ScrollReveal;
 * body copy and UI text keep using ScrollReveal.
 *
 * SSR-safe (full text in markup), waits for fonts so lines split correctly,
 * and renders statically under prefers-reduced-motion (BRIEF §7.9).
 * Thai copy has no word spaces — it gracefully degrades to a per-line rise.
 */
export function SplitTextReveal({
  as: Tag = "h2",
  children,
  className = "",
  delay = 0,
  stagger = 0.05,
}: {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Hide until fonts settle so the split happens on final line breaks —
      // autoAlpha (not display) keeps layout stable.
      gsap.set(el, { autoAlpha: 0 });

      let split: SplitText | undefined;
      let cancelled = false;

      document.fonts.ready.then(() => {
        if (cancelled || !ref.current) return;
        split = SplitText.create(el, {
          type: "lines,words",
          mask: "lines",
          linesClass: "split-line",
        });
        gsap.set(el, { autoAlpha: 1 });
        gsap.fromTo(
          split.words,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger,
            delay,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          },
        );
      });

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref },
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}
