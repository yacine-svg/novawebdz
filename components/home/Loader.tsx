"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLang } from "@/lib/i18n";
import { useStreetSnapshot } from "@/lib/streetStore";
import { switchOnStreet } from "./Street";

let shownOnce = false;

/** "NOVA WEB DZ" with a progress counter, then the street lights switch on. */
export default function Loader() {
  const { t } = useLang();
  const { ready } = useStreetSnapshot();
  const [p, setP] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (shownOnce) {
      setGone(true);
      switchOnStreet(true);
      return;
    }
    const start = performance.now();
    let value = 0;
    let raf = 0;
    let prev = start;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      shownOnce = true;
      setOut(true);
      window.setTimeout(() => switchOnStreet(reduced), reduced ? 0 : 350);
      window.setTimeout(() => setGone(true), reduced ? 50 : 1150);
    };
    const loop = () => {
      const now = performance.now();
      const elapsed = now - start;
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const isReady = readyRef.current || elapsed > 5000; // never block the visitor
      const target = isReady ? 100 : Math.min(88, (elapsed / 1400) * 88);
      // time-based easing: same speed at any frame rate
      value += (target - value) * (reduced ? 1 : 1 - Math.exp(-dt * 5.5));
      setP(value);
      if (isReady && value > 99.4 && elapsed > (reduced ? 150 : 1000)) return finish();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;
  const pct = `${p.toFixed(1)}%`;
  return (
    <div className={`loader${out ? " out" : ""}`} style={{ "--p": pct } as CSSProperties} role="status" aria-live="polite" aria-label={t.loader.label}>
      <div className="loader-brand" aria-hidden="true">
        {t.loader.brand}
        <span>{t.loader.brand}</span>
      </div>
      <div className="loader-foot">
        <p className="mono" style={{ color: "var(--muted)" }}>
          {t.loader.label}
        </p>
        <p className="loader-count">{String(Math.round(p)).padStart(3, "0")}</p>
      </div>
      <i className="loader-bar" />
    </div>
  );
}
