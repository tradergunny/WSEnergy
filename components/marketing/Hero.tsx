"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconShieldCheckered,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";

export function Hero({
  eyebrow,
  headlineLines,
  subhead,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  headlineLines: string[];
  subhead: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden bg-forest-900">
      {/* Background photo */}
      <Image
        src="/hero-villa.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Localized backdrop blur — soft-focuses the photo behind the text only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage:
            "radial-gradient(ellipse 70% 65% at 50% 50%, black 18%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 65% at 50% 50%, black 18%, transparent 82%)",
        }}
      />
      {/* Soft scrim on the blur + subtle top/bottom letterbox */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 68% 62% at 50% 50%, rgba(0, 28, 16, 0.62) 0%, rgba(0, 28, 16, 0.32) 50%, rgba(0, 28, 16, 0) 82%), linear-gradient(180deg, rgba(0, 38, 22, 0.5) 0%, rgba(0, 38, 22, 0) 18%, rgba(0, 38, 22, 0) 80%, rgba(0, 38, 22, 0.72) 100%)",
        }}
      />

      {/* Foreground content */}
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-32 lg:pb-40">
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-mist-400/25 bg-mist-50/5 px-4 py-1.5 text-caption font-mono uppercase tracking-[0.18em] text-mist-200 backdrop-blur-sm"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500" />
            {eyebrow}
          </motion.span>

          <h1
            className="mt-8 max-w-4xl font-medium text-mist-50"
            style={{
              fontSize: "clamp(36px, 6.4vw, 72px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
            }}
          >
            {headlineLines.map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-body-lg mt-7 max-w-2xl text-mist-400"
          >
            {subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button variant="primary" size="lg" href={primaryCta.href}>
              {primaryCta.label}
              <IconArrowRight
                size={16}
                stroke={2}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
              />
            </Button>
            <Link
              href={secondaryCta.href}
              className="text-body group/btn inline-flex items-center gap-2 rounded-full border border-mist-400/30 px-[26px] py-[14px] font-medium text-mist-50 transition-colors hover:bg-mist-50/5 hover:border-mist-400/60"
            >
              {secondaryCta.label}
              <IconArrowUpRight
                size={16}
                stroke={2}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </Link>
          </motion.div>

          {/* Floating safety chip */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-16 inline-flex items-center gap-3 rounded-full border border-mist-400/15 bg-forest-950/60 px-5 py-2.5 backdrop-blur-sm"
          >
            <IconShieldCheckered size={16} stroke={1.5} className="text-gold-500" />
            <span className="text-caption font-medium text-mist-200">
              Authorized Projoy distributor · Rapid Shutdown exclusive in Thailand
            </span>
          </motion.div>
        </div>
      </div>

      {/* Bottom hairline + corner pixel grid */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-mist-400/30 to-transparent" />
      <div className="bg-grid-mist pointer-events-none absolute -top-px -left-px h-24 w-32 opacity-50 [mask-image:linear-gradient(to_bottom_right,black,transparent)]" />
      <div className="bg-grid-mist pointer-events-none absolute -top-px -right-px h-24 w-32 opacity-50 [mask-image:linear-gradient(to_bottom_left,black,transparent)]" />
    </section>
  );
}
