/**
 * Root layout for the Sanity Studio sub-tree.
 * Studio renders its own chrome; we just supply <html>/<body>.
 * No globals.css here — Studio ships its own styles and we want to keep
 * the marketing reset separate.
 */
export const metadata = {
  title: "WS Energy Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
