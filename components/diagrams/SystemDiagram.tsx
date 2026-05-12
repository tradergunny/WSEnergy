"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Interactive Rapid Shutdown system diagram — BRIEF §6.2 §4 and §8.9.
 *
 * Pure SVG + React state. No animation library.
 * Stroke colors are inline style props because Tailwind utilities do not
 * compile down to the SVG `stroke` attribute. CSS transitions on `stroke`
 * give us the 180ms ease-out called for in BRIEF §7.9.
 *
 * Color tokens are duplicated as constants below so the diagram remains
 * self-contained; they match the values in app/globals.css @theme.
 */

const COLOR_SAFETY_600 = "#a32d2d";
const COLOR_BRAND_600 = "#185fa5";
const COLOR_GRAPHITE_600 = "#5f5e5a";
const COLOR_GRAPHITE_200 = "#d3d1c7";
const COLOR_GRAPHITE_900 = "#1a1a19";
const COLOR_GRAPHITE_50 = "#f8f8f7";
const COLOR_WARNING_BG = "#faeeda";
const COLOR_WARNING_BORDER = "#fac775";
const COLOR_WARNING_TEXT = "#854f0b";

type DiagramState =
  | "live"
  | "shutdown-initiated"
  | "pefs-tripped"
  | "deenergized";

const STATE_DWELL_MS = 2000;

type Node = {
  id: string;
  x: number;
  cy: number;
  label: string;
};

const NODE_Y = 140;
const NODES: Node[] = [
  { id: "pv", x: 60, cy: NODE_Y, label: "PV Modules" },
  { id: "pefs", x: 200, cy: NODE_Y, label: "PEFS Units" },
  { id: "dc", x: 340, cy: NODE_Y, label: "DC String" },
  { id: "control", x: 480, cy: NODE_Y, label: "Control Box" },
  { id: "inverter", x: 620, cy: NODE_Y, label: "Inverter" },
  { id: "grid", x: 760, cy: NODE_Y, label: "Grid" },
];

// Segment indices match the gaps between NODES.
// 0: pv→pefs   1: pefs→dc   2: dc→control   3: control→inverter   4: inverter→grid
type Labels = {
  triggerShutdown: string;
  reset: string;
  statusLive: string;
  statusShutdown: string;
  statusPefs: string;
  statusDeenergized: string;
};

export type SystemDiagramProps = {
  labels: Labels;
  nodeLabels?: Partial<Record<Node["id"], string>>;
};

export function SystemDiagram({ labels, nodeLabels }: SystemDiagramProps) {
  const [state, setState] = useState<DiagramState>("live");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const trigger = useCallback(() => {
    clearTimers();
    setState("shutdown-initiated");
    timersRef.current.push(
      setTimeout(() => setState("pefs-tripped"), STATE_DWELL_MS),
    );
    timersRef.current.push(
      setTimeout(() => setState("deenergized"), STATE_DWELL_MS * 2),
    );
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setState("live");
  }, [clearTimers]);

  const isRunning = state !== "live" && state !== "deenergized";

  const statusText: string = (() => {
    switch (state) {
      case "live":
        return labels.statusLive;
      case "shutdown-initiated":
        return labels.statusShutdown;
      case "pefs-tripped":
        return labels.statusPefs;
      case "deenergized":
        return labels.statusDeenergized;
    }
  })();

  const statusColor =
    state === "deenergized"
      ? COLOR_GRAPHITE_600
      : state === "live"
        ? COLOR_SAFETY_600
        : COLOR_WARNING_TEXT;

  return (
    <div className="border-graphite-200 bg-graphite-50 rounded-lg border p-6">
      <div
        role="img"
        aria-label={`${labels.statusLive} → ${labels.statusDeenergized}`}
        className="w-full overflow-x-auto"
      >
        <svg
          viewBox="0 0 820 220"
          className="block min-w-[820px] w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connecting lines */}
          {NODES.slice(0, -1).map((from, i) => {
            const to = NODES[i + 1];
            const color = segmentColor(state, i);
            return (
              <line
                key={`seg-${i}`}
                x1={from.x + 38}
                y1={from.cy}
                x2={to.x - 38}
                y2={to.cy}
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                style={{ transition: "stroke 180ms ease-out" }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((n) => {
            const isControl = n.id === "control";
            const isShutdownActive =
              isControl &&
              (state === "shutdown-initiated" || state === "pefs-tripped");
            const fill = isShutdownActive
              ? COLOR_WARNING_BG
              : COLOR_GRAPHITE_50;
            const stroke = isShutdownActive
              ? COLOR_WARNING_BORDER
              : COLOR_GRAPHITE_200;
            return (
              <g key={n.id}>
                <rect
                  x={n.x - 38}
                  y={n.cy - 26}
                  width={76}
                  height={52}
                  rx={8}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1}
                  style={{
                    transition: "fill 180ms ease-out, stroke 180ms ease-out",
                  }}
                />
                <text
                  x={n.x}
                  y={n.cy + 4}
                  textAnchor="middle"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={11}
                  fontWeight={500}
                  fill={COLOR_GRAPHITE_900}
                >
                  {nodeLabels?.[n.id] ?? n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p
          className="text-body font-medium"
          style={{ color: statusColor, transition: "color 180ms ease-out" }}
          aria-live="polite"
        >
          {statusText}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={trigger}
            disabled={isRunning}
          >
            {labels.triggerShutdown}
          </Button>
          <Button variant="outline-primary" size="md" onClick={reset}>
            {labels.reset}
          </Button>
        </div>
      </div>
    </div>
  );
}

function segmentColor(state: DiagramState, index: number): string {
  // Segments (5 total): 0 PV→PEFS · 1 PEFS→DC · 2 DC→Control · 3 Control→Inv · 4 Inv→Grid
  switch (state) {
    case "live":
      return COLOR_SAFETY_600;
    case "shutdown-initiated":
      // Signal path Control Box → PEFS travels back through segments 2 and 1.
      return index === 1 || index === 2 ? COLOR_BRAND_600 : COLOR_SAFETY_600;
    case "pefs-tripped":
      // Upstream of PEFS de-energized (segments 0 and 1). Downstream still live.
      return index <= 1 ? COLOR_GRAPHITE_600 : COLOR_SAFETY_600;
    case "deenergized":
      return COLOR_GRAPHITE_600;
  }
}
