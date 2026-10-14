"use client";

import { useSyncExternalStore } from "react";

/* Shared state between the scroll (DOM) and the 3D / 2D street.
   Fast values (progress, pointer) are read every frame without re-rendering React;
   React components subscribe only to the few values they display. */

type Flight = { index: number; slug: string } | null;

export const street = {
  progress: 0, // 0..1 along the street section
  intro: 0, // 0..1 lights switching on
  pointer: null as null | { x: number; y: number },
  hover: -1,
  flight: null as Flight,
  ready: false,
};

type Snapshot = { active: number; hover: number; ready: boolean; flying: boolean };
let snapshot: Snapshot = { active: -1, hover: -1, ready: false, flying: false };
const listeners = new Set<() => void>();

export function publish(patch: Partial<Snapshot>) {
  const next = { ...snapshot, ...patch };
  if (next.active === snapshot.active && next.hover === snapshot.hover && next.ready === snapshot.ready && next.flying === snapshot.flying) return;
  snapshot = next;
  listeners.forEach((l) => l());
}

export function useStreetSnapshot() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => snapshot,
  );
}

/** Number of transitions between the entrance and the last shop. */
export const streetSegments = (shopCount: number) => shopCount;

/** Continuous street position (0 = entrance, i + 1 = shop i) from scroll progress. */
export const streetT = (progress: number, shopCount: number) => Math.min(1, Math.max(0, progress)) * streetSegments(shopCount);

/** Shop centred on screen (or -1), same rule as the 3D camera path. */
export function activeShopAt(progress: number, shopCount: number) {
  const t = streetT(progress, shopCount);
  const k = Math.round(t);
  return Math.abs(t - k) < 0.34 && k >= 1 ? k - 1 : -1;
}

const DWELL = 0.2; // share of each segment where the street rests on a shop
const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

/** Eases one segment so the view holds still around each shop (shared by the 3D camera and the 2D street). */
export function plateau(f: number) {
  if (f <= DWELL) return 0;
  if (f >= 1 - DWELL) return 1;
  return smoother((f - DWELL) / (1 - 2 * DWELL));
}
