"use client";

import { useEffect } from "react";

/** Film grain + a soft red/blue light that follows the cursor. */
export default function Ambient() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 50, y = 30;
    const move = (e: PointerEvent) => {
      x = (e.clientX / window.innerWidth) * 100;
      y = (e.clientY / window.innerHeight) * 100;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          document.documentElement.style.setProperty("--mx", `${x}%`);
          document.documentElement.style.setProperty("--my", `${y}%`);
        });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <>
      <div className="cursor-light" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
