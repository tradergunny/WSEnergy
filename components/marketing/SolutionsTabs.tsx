"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconHome,
  IconBuildingFactory2,
  IconSolarPanel,
  IconActivityHeartbeat,
  IconArrowUpRight,
} from "@tabler/icons-react";

export type SolutionTab = {
  key: "residential" | "ci" | "solar-farm" | "scada";
  label: string;
  title: string;
  body: string;
  bullets: string[];
  href: string;
  ctaLabel: string;
};

const iconMap = {
  residential: IconHome,
  ci: IconBuildingFactory2,
  "solar-farm": IconSolarPanel,
  scada: IconActivityHeartbeat,
} as const;

export function SolutionsTabs({ tabs }: { tabs: SolutionTab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  const Icon = iconMap[current.key];

  return (
    <div>
      {/* Tab row */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`text-eyebrow rounded-full px-4 py-2 transition-colors ${
                isActive
                  ? "bg-gold-500 text-forest-900"
                  : "bg-mist-50/5 text-mist-200 hover:bg-mist-50/10"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Side card: copy */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl bg-forest-950 p-8 lg:col-span-5"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-500">
              <Icon size={22} stroke={1.5} />
            </div>
            <h3 className="text-h2 font-medium tracking-tight text-mist-50">
              {current.title}
            </h3>
            <p className="text-body-lg mt-3 text-mist-400">{current.body}</p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {current.bullets.map((b) => (
                <li
                  key={b}
                  className="text-body flex items-start gap-2 text-mist-200"
                >
                  <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-gold-500" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href={current.href}
              className="text-body group/btn mt-7 inline-flex items-center gap-1.5 font-medium text-gold-500 hover:text-gold-400"
            >
              {current.ctaLabel}
              <IconArrowUpRight
                size={16}
                stroke={2}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Illustration panel */}
        <div className="relative overflow-hidden rounded-xl bg-forest-800 lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-grid-mist relative flex aspect-[5/4] items-center justify-center lg:aspect-auto lg:h-full"
            >
              {/* Decorative panel-grid suggestion */}
              <svg
                className="h-3/4 w-3/4 text-gold-500/30"
                viewBox="0 0 200 160"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.75"
                aria-hidden
              >
                <g>
                  {Array.from({ length: 4 }).map((_, row) =>
                    Array.from({ length: 5 }).map((_, col) => (
                      <rect
                        key={`${row}-${col}`}
                        x={20 + col * 32}
                        y={20 + row * 28}
                        width={28}
                        height={24}
                        rx="2"
                      />
                    )),
                  )}
                </g>
              </svg>
              <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-forest-900/70 px-3 py-1.5 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500" />
                <span className="text-caption font-mono uppercase tracking-wider text-mist-200">
                  {current.label}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
