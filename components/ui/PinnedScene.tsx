"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * PinnedScene — BRIEF §7.10
 * A scroll "runway" (`length` viewports tall) with a sticky full-screen stage.
 * Publishes scroll progress (0→1 across the runway) to children via context,
 * so a scene can be choreographed against scroll without owning ScrollTrigger
 * plumbing itself. Children read `progress` (a ref — updated outside React
 * render) or build their own scrubbed timelines against `wrapper`.
 *
 * Reduced motion: the runway collapses to a single static viewport and
 * progress locks at 1 (final state), per BRIEF §7.9.
 */
type PinnedSceneContextValue = {
  /** Live scroll progress 0→1. A ref — read per-frame, never re-renders. */
  progress: RefObject<number>;
  /**
   * The runway element — use as `trigger` for scrubbed child timelines.
   * NOTE: child layout effects run before this ref is attached; resolve the
   * runway from your own element via `el.closest('[data-pinned-runway]')`
   * when building timelines inside a layout effect (useGSAP).
   */
  wrapper: RefObject<HTMLDivElement | null>;
  /** True when prefers-reduced-motion — children should render final state. */
  reduced: boolean;
};

const PinnedSceneContext = createContext<PinnedSceneContextValue | null>(null);

export function usePinnedScene() {
  return useContext(PinnedSceneContext);
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotion() {
  return false;
}

export function PinnedScene({
  length = 2,
  className = "",
  stageClassName = "",
  children,
}: {
  /** Runway height in viewports. 2 = one viewport of pinned scroll. */
  length?: number;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  useEffect(() => {
    if (reduced) progress.current = 1;
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced || !wrapper.current) return;
      ScrollTrigger.create({
        trigger: wrapper.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
    },
    { scope: wrapper, dependencies: [reduced] },
  );

  return (
    <PinnedSceneContext.Provider value={{ progress, wrapper, reduced }}>
      <div
        ref={wrapper}
        data-pinned-runway=""
        className={className}
        style={{ height: reduced ? "auto" : `calc(${length} * 100svh)` }}
      >
        <div
          className={
            (reduced
              ? "relative min-h-svh "
              : "sticky top-0 h-svh overflow-hidden ") + stageClassName
          }
        >
          {children}
        </div>
      </div>
    </PinnedSceneContext.Provider>
  );
}
