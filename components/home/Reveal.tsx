"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from "react";

/** Fades its content in when it scrolls into view (instant with reduced motion). */
export default function Reveal({ as: Tag = "div", className = "", style, delay = 0, children }: { as?: ElementType; className?: string; style?: CSSProperties; delay?: number; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}s`, ...style }}>
      {children}
    </Tag>
  );
}
