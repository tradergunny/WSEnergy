/**
 * ZoomScale — density counter-scale for routes that opt out of the global
 * `html { zoom: 0.8125 }` density knob (see app/globals.css).
 *
 * The site-wide knob shrinks everything to 81.25%. A few templates (product
 * and safety detail) want their original 100% tuning. The obvious fix —
 * `zoom: 1.2308` — silently breaks IntersectionObserver for the whole subtree
 * (framer-motion `whileInView`, the ProductSectionNav scroll-spy), because
 * Chromium's IO implementation mishandles the legacy `zoom` property.
 *
 * `transform: scale()` up-scales identically but keeps IO intact. To stop the
 * scaled box from overflowing / leaving a gap, the element is given a
 * reciprocal width (100 / scale %) with `transform-origin: top left`, so the
 * post-scale footprint is exactly 100% width and the natural document height.
 *
 * NOTE: `transform` makes this the containing block for any descendant
 * `position: sticky`. ProductSectionNav sticks relative to the viewport via a
 * JS-computed `top`, and has been verified to remain sticky inside this
 * wrapper.
 */
const SCALE = 1.2308; // 1 / 0.8125

export function ZoomScale({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        transform: `scale(${SCALE})`,
        transformOrigin: "top left",
        width: `${100 / SCALE}%`,
      }}
    >
      {children}
    </div>
  );
}
