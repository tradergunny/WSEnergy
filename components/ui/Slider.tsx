"use client";

import type { ReactNode } from "react";

/**
 * Slider — BRIEF §8.11 branded range input.
 * Gold fill on a mist rail with a 28px warm-bone thumb (a real touch target)
 * and a gold focus ring. The native <input type="range"> stays in the tree as
 * an invisible overlay, so keyboard, screen-reader, and drag behaviour are the
 * platform's own — the visible rail/fill/thumb only mirror its value.
 *
 * `fillClassName` reskins the filled track (e.g. the estimator's day→night
 * gradient); `thumbIcon` renders inside the thumb disc.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  ariaLabel,
  fillClassName = "bg-gold-500",
  railClassName = "bg-mist-800",
  thumbIcon,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel: string;
  fillClassName?: string;
  railClassName?: string;
  thumbIcon?: ReactNode;
  className?: string;
}) {
  const pct = max > min ? (value - min) / (max - min) : 0;
  // The thumb travels inside (width − 28px) so its edges never overhang the
  // rail — matching how native range thumbs move, which keeps the invisible
  // native input and the visible thumb aligned while dragging.
  const thumbLeft = `calc(${pct} * (100% - 28px))`;
  const fillWidth = `calc(${pct} * (100% - 28px) + 14px)`;

  return (
    <div className={`relative h-7 ${className}`.trim()}>
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full ${railClassName}`}
      />
      <div
        aria-hidden="true"
        className={`absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full ${fillClassName}`}
        style={{ width: fillWidth }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className="peer absolute inset-0 z-10 w-full cursor-pointer appearance-none bg-transparent opacity-0 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:border-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold-500 bg-card-50 text-forest-900 shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-gold-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-forest-900"
        style={{ left: thumbLeft }}
      >
        {thumbIcon}
      </div>
    </div>
  );
}
