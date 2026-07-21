/**
 * SectionGlow — a barely-there mist wash that lifts a flat forest section
 * without breaking theme lock. Extends the luminous vocabulary the safety
 * act established (soft radial light, no particles, no gold) to sections
 * that would otherwise read as solid paint.
 *
 * Host section must be `relative overflow-hidden`; render this before the
 * content wrapper so normal-flow content paints above it.
 */
const ANCHOR = {
  "top-left": "22% 0%",
  "top-center": "50% 0%",
  "top-right": "78% 0%",
} as const;

export function SectionGlow({
  position = "top-left",
}: {
  position?: keyof typeof ANCHOR;
}) {
  const at = ANCHOR[position];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 55% 60% at ${at}, color-mix(in srgb, var(--color-mist-200) 6%, transparent), transparent 70%)`,
      }}
    />
  );
}
