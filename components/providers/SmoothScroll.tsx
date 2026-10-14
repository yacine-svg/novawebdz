"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Keeps ScrollTrigger in step with Lenis, and handles route changes. */
function LenisSync() {
  const pathname = usePathname();
  const lenis = useLenis(() => ScrollTrigger.update());

  useEffect(() => {
    if (!lenis) return;
    // let the browser jump to a #hash (e.g. back to a shop), otherwise start at the top
    if (!window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return null;
}

/** One clock for everything: GSAP's ticker drives Lenis, ScrollTrigger and the 3D street. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let configured = false;
    function update(time: number) {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      if (!configured) {
        configured = true;
        // reduced motion: no smoothing, the browser scrolls natively
        if (reduce) {
          lenis.options.smoothWheel = false;
          lenis.options.lerp = 1;
        }
      }
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    // syncTouch stays off: phones keep their native scrolling
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.09, smoothWheel: true, syncTouch: false }}>
      <LenisSync />
      {children}
    </ReactLenis>
  );
}

/** Scroll to an element or a y position, through Lenis when it is running. */
export function smoothScrollTo(target: HTMLElement | number, opts: { offset?: number; immediate?: boolean } = {}) {
  const w = window as Window & { __lenis?: { scrollTo: (t: HTMLElement | number, o?: object) => void } };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
  if (w.__lenis && !reduce && !opts.immediate) w.__lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: reduce || opts.immediate ? "auto" : "smooth" });
}

/** Exposes the Lenis instance for smoothScrollTo (set once Lenis exists). */
export function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    (window as Window & { __lenis?: unknown }).__lenis = lenis;
    return () => {
      (window as Window & { __lenis?: unknown }).__lenis = undefined;
    };
  }, [lenis]);
  return null;
}
