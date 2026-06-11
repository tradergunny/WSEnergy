"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { IconShieldCheckered } from "@tabler/icons-react";

/**
 * ProductBounceCard — floating product hero for marketing surfaces.
 * BRIEF §7.9 (motion) — adds a slow rise-fall + 3D rotateY rocking,
 * with a soft puddle-shadow underneath that contracts on the lift.
 *
 * Use to make a hero product feel weighty without a heavy frame.
 * Sits naked on the forest canvas — no card surface — so the shadow reads.
 */
type ProductBounceCardProps = {
  imageUrl: string;
  alt?: string;
  /** When set, renders this instead of the broken-image fallback icon. */
  fallback?: React.ReactNode;
  className?: string;
};

export function ProductBounceCard({
  imageUrl,
  alt = "Product image",
  fallback,
  className = "",
}: ProductBounceCardProps) {
  const [errored, setErrored] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  // SSR-rendered <img> elements that already 404'd before hydration won't
  // re-fire `error` on the client. Check the underlying HTMLImageElement on
  // mount and flip to fallback if it's complete with no natural dimensions.
  React.useEffect(() => {
    const node = imgRef.current;
    if (node && node.complete && node.naturalWidth === 0) {
      setErrored(true);
    }
  }, []);

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
    >
      {errored ? (
        <motion.div
          className="flex h-64 w-64 items-center justify-center text-gold-500/90"
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        >
          {fallback ?? <IconShieldCheckered size={140} stroke={1.25} />}
        </motion.div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <motion.img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          onError={() => setErrored(true)}
          className="h-64 w-auto select-none object-contain md:h-72 lg:h-80"
          draggable={false}
          animate={{
            y: [0, -20, 0],
            rotateY: [0, 10, -10, 0],
          }}
          transition={{
            duration: 1.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformStyle: "preserve-3d" }}
        />
      )}

      {/* Puddle shadow — contracts and brightens as the product lifts. */}
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-2 h-6 w-48 rounded-full bg-black/40 blur-md"
        animate={{ scaleX: [1, 0.78, 1], opacity: [0.55, 0.35, 0.55] }}
        transition={{
          duration: 1.7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
