"use client";

import { useEffect, useState } from "react";

export type StreetMode = "3d" | "2d";

/** Decides between the 3D street and the 2D illustrated version.
    Phones, small touch screens, weak devices, data-saver and missing WebGL get 2D.
    Add ?street=2d or ?street=3d to the address to force one (handy for testing). */
export function detectStreetMode(): StreetMode {
  if (typeof window === "undefined") return "2d";
  const forced = new URLSearchParams(window.location.search).get("street");
  if (forced === "2d" || forced === "3d") return forced;

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "2d";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700 || window.innerWidth < 900;
  if (coarse && small) return "2d";
  if (window.innerWidth < 760) return "2d";
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  if (cores <= 2 || memory <= 2) return "2d";
  if (cores <= 4 && memory <= 4 && coarse) return "2d";

  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "2d";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    // software rendering would make the street crawl
    if (/swiftshader|llvmpipe|software/i.test(renderer) && !forced) return "2d";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "2d";
  }
  return "3d";
}

export function useStreetMode() {
  const [mode, setMode] = useState<StreetMode | null>(null);
  useEffect(() => setMode(detectStreetMode()), []);
  return mode;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
