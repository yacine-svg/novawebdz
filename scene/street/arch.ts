import * as THREE from "three";
import type { ArchStyle } from "./types";

export type ArchDims = { w: number; spring: number; top: number };

/** Opening sizes for each style, all fitting under the 5 m ground floor. */
export function archDims(style: ArchStyle, big = true): ArchDims {
  if (!big) return { w: 2.6, spring: 2.3, top: 3.6 };
  switch (style) {
    case "horseshoe":
      return { w: 4.3, spring: 2.25, top: 4.66 };
    case "pointed":
      return { w: 4.1, spring: 2.0, top: 4.75 };
    case "square":
      return { w: 4.8, spring: 3.9, top: 3.9 };
    default:
      return { w: 4.6, spring: 2.35, top: 4.65 };
  }
}

/** Points of the opening outline, from bottom-left, over the top, to bottom-right. */
export function archPoints(style: ArchStyle, cx: number, d: ArchDims, seg = 28): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const half = d.w / 2;
  pts.push(new THREE.Vector2(cx - half, 0));
  if (style === "square") {
    pts.push(new THREE.Vector2(cx - half, d.top), new THREE.Vector2(cx + half, d.top));
  } else if (style === "horseshoe") {
    const R = d.top - d.spring;
    const delta = Math.acos(Math.min(1, half / R));
    const jamb = d.spring - R * Math.sin(delta);
    pts.push(new THREE.Vector2(cx - half, jamb));
    const a0 = Math.PI + delta, a1 = -delta;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (a1 - a0) * (i / seg);
      pts.push(new THREE.Vector2(cx + R * Math.cos(a), d.spring + R * Math.sin(a)));
    }
  } else if (style === "pointed") {
    const off = d.w * 0.2, r = half + off;
    const apexA = Math.acos(-off / r);
    pts.push(new THREE.Vector2(cx - half, d.spring));
    for (let i = 1; i <= seg / 2; i++) {
      const a = Math.PI + (apexA - Math.PI) * (i / (seg / 2));
      pts.push(new THREE.Vector2(cx + off + r * Math.cos(a), d.spring + r * Math.sin(a)));
    }
    for (let i = 1; i <= seg / 2; i++) {
      const a = Math.PI - apexA + (0 - (Math.PI - apexA)) * (i / (seg / 2));
      pts.push(new THREE.Vector2(cx - off + r * Math.cos(a), d.spring + r * Math.sin(a)));
    }
  } else {
    pts.push(new THREE.Vector2(cx - half, d.spring));
    for (let i = 1; i < seg; i++) {
      const a = Math.PI - Math.PI * (i / seg);
      pts.push(new THREE.Vector2(cx + half * Math.cos(a), d.spring + half * Math.sin(a)));
    }
    pts.push(new THREE.Vector2(cx + half, d.spring));
  }
  pts.push(new THREE.Vector2(cx + half, 0));
  return pts;
}

/** Closed shape of the opening (used for glass and for the wall holes). */
export function archShape(style: ArchStyle, cx: number, d: ArchDims) {
  const p = archPoints(style, cx, d);
  const s = new THREE.Path();
  s.moveTo(p[0].x, p[0].y);
  for (let i = 1; i < p.length; i++) s.lineTo(p[i].x, p[i].y);
  s.lineTo(p[0].x, p[0].y);
  return s;
}
