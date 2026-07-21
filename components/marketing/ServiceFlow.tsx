"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  IconFileCheck,
  IconTruckDelivery,
  IconTools,
  IconPresentation,
  IconHeadset,
} from "@tabler/icons-react";

export type ServiceFlowStep = {
  key: "design" | "delivery" | "install" | "commissioning" | "aftersale";
  title: string;
  detail: string;
};

const iconMap = {
  design: IconFileCheck,
  delivery: IconTruckDelivery,
  install: IconTools,
  commissioning: IconPresentation,
  aftersale: IconHeadset,
} as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Pulse choreography. The gold pulse leaves station one PULSE_DELAY
   seconds after the line finishes drawing, crosses in TRAVEL seconds
   (linear, so station timing stays predictable), rests for GAP, and
   goes again. Each station's flare is phase-locked to the pulse's
   arrival at its position along the line. */
const PULSE_DELAY = 1.5;
const TRAVEL = 2.2;
const GAP = 1.4;
const PERIOD = TRAVEL + GAP;
const FLARE = 0.7;
const flareDelay = (i: number) => PULSE_DELAY + (TRAVEL * i) / 4 - 0.25;

/* Hex mirrors of --color-mist-800 / --color-mist-200 / --color-gold-500:
   framer-motion cannot interpolate var() colors in keyframes. */
const MIST_800 = "#3a4a42";
const MIST_200 = "#e0e6e2";
const GOLD_500 = "#f4c21b";

export function ServiceFlow({ steps }: { steps: ServiceFlowStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const show = inView || Boolean(reduce);
  const animate = inView && !reduce;

  return (
    <div ref={ref} className="relative">
      {/* Desktop connector: the service line draws itself through the
          five stations, then the gold pulse patrols it on a loop —
          the safety act's energized-line grammar. 9% is roughly the
          center of the first and last of five equal grid columns; the
          small drift across container widths stays hidden behind the
          48px icon discs. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[9%] top-[23px] hidden h-0.5 w-[82%] md:block"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 0 1 H 100"
          className="stroke-mist-800"
          strokeWidth="1.5"
          fill="none"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          animate={show ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
        />
        {!reduce && (
          <motion.path
            d="M 0 1 H 100"
            pathLength={1}
            className="stroke-gold-500"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            style={{ strokeDasharray: "0.05 0.95" }}
            initial={{ strokeDashoffset: 1, opacity: 0 }}
            animate={
              animate
                ? { strokeDashoffset: 0.05, opacity: [0, 1, 1, 0] }
                : undefined
            }
            transition={{
              delay: PULSE_DELAY,
              duration: TRAVEL,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: GAP,
              opacity: {
                delay: PULSE_DELAY,
                duration: TRAVEL,
                times: [0, 0.08, 0.92, 1],
                ease: "linear",
                repeat: Infinity,
                repeatDelay: GAP,
              },
            }}
          />
        )}
      </svg>

      {/* Mobile connector: a static vertical rail behind the icon
          column; the discs' solid fill masks it into segments. */}
      <div
        aria-hidden="true"
        className="absolute top-6 bottom-10 left-6 w-px bg-mist-800/70 md:hidden"
      />

      <ol className="relative grid grid-cols-1 gap-7 md:grid-cols-5 md:gap-4">
        {steps.map((step, i) => {
          const Icon = iconMap[step.key];
          return (
            <motion.li
              key={step.key}
              className="flex items-start gap-5 md:flex-col md:items-center md:gap-0 md:text-center"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              transition={{
                duration: 0.5,
                ease: EASE,
                /* Stations appear as the drawing line reaches them. */
                delay: reduce ? 0 : 0.2 + i * 0.22,
              }}
            >
              {/* Each disc flares gold the moment the pulse passes
                  through it: border, glyph, and a soft backlit glow,
                  then it hands the energy to the next station. */}
              <motion.div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-mist-800 bg-forest-950 text-mist-200"
                animate={
                  animate
                    ? {
                        borderColor: [MIST_800, GOLD_500, MIST_800],
                        color: [MIST_200, GOLD_500, MIST_200],
                        scale: [1, 1.08, 1],
                        boxShadow: [
                          "0 0 0px 0px rgba(244, 194, 27, 0)",
                          "0 0 22px 2px rgba(244, 194, 27, 0.28)",
                          "0 0 0px 0px rgba(244, 194, 27, 0)",
                        ],
                      }
                    : undefined
                }
                transition={{
                  delay: flareDelay(i),
                  duration: FLARE,
                  times: [0, 0.4, 1],
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: PERIOD - FLARE,
                }}
              >
                <Icon size={20} stroke={1.5} />
              </motion.div>
              <div className="md:mt-3.5">
                <p className="text-body font-medium text-mist-50">
                  {step.title}
                </p>
                <p className="text-caption mt-1 text-mist-400">{step.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
