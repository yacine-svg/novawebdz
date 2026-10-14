import { shopSpecs } from "@/data/projects";
import { createStreet } from "./street";

/** Reads the font families that next/font exposes as CSS variables. */
export function cssFont(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Builds the street once the display font is loaded (it is drawn on the neon signs). */
export async function buildStreet() {
  const display = cssFont("--font-display-face", "system-ui, sans-serif");
  const mono = cssFont("--font-mono-face", "monospace");
  await Promise.race([document.fonts.load(`700 120px ${display}`), new Promise((r) => setTimeout(r, 2500))]).catch(() => undefined);
  return createStreet({ shops: shopSpecs, fonts: { display, mono } });
}
