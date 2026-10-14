"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { emptyShop, projects } from "@/data/projects";
import { plateau, street as S, streetT } from "@/lib/streetStore";
import type { ShopKind } from "@/scene/street/types";

/* The same street, drawn in layers for phones, weak devices and browsers without WebGL.
   It follows the same scroll story: one shop per screen, threads lighting up as you go. */

type Props = { reducedMotion: boolean; onOpen: (slug: string) => void; onEmpty: () => void };

const SHOPS = projects.length + 1;

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function Detail({ kind }: { kind: ShopKind }) {
  switch (kind) {
    case "barber":
      return <div className="d-pole" />;
    case "gym":
      return <div className="d-flicker" />;
    case "garage":
      return <div className="d-shutter" />;
    case "restaurant":
      return (
        <div style={{ display: "flex", gap: 18 }}>
          <div className="d-lantern" />
          <div className="d-lantern" style={{ animationDelay: "-.8s" }} />
          <div className="d-lantern" style={{ animationDelay: "-1.4s" }} />
        </div>
      );
    case "beauty":
      return <div className="d-bottle" />;
    case "dental":
      return <div className="d-tooth" />;
    case "realestate":
      return <div className="d-swing">À VENDRE</div>;
    case "wedding":
      return <div className="d-lights" />;
    case "travel":
      return <div className="d-globe" />;
    default:
      return <div className="d-bulb" />;
  }
}

function Building({ seed, floors }: { seed: number; floors: number }) {
  const r = rand(seed);
  const windows = Array.from({ length: floors * 3 }, () => r() < 0.4);
  return (
    <div className="s2d-windows" style={{ gridTemplateRows: `repeat(${floors}, 1fr)` }}>
      {windows.map((on, i) => (
        <i key={i} className={on ? "on" : undefined} />
      ))}
    </div>
  );
}

export default function Street2D({ reducedMotion, onOpen, onEmpty }: Props) {
  const strip = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const threads = useRef<SVGSVGElement>(null);
  const items = useMemo(
    () => [
      ...projects.map((p) => ({ slug: p.slug, sign: p.sign, kind: p.kind, arch: p.arch, neon: p.colors.neon, top: p.colors.interiorTop, bottom: p.colors.interiorBottom })),
      { slug: emptyShop.slug, sign: emptyShop.sign, kind: "empty" as ShopKind, arch: "round" as const, neon: emptyShop.colors.neon, top: emptyShop.colors.interiorTop, bottom: emptyShop.colors.interiorBottom },
    ],
    [],
  );

  useEffect(() => {
    let raf = 0;
    let t = -1;
    let prev = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      // same resting points as the 3D camera: each shop holds still for a moment
      const raw = streetT(S.progress, SHOPS);
      const target = Math.floor(raw) + plateau(raw - Math.floor(raw));
      t = reducedMotion || t < 0 ? target : t + (target - t) * (1 - Math.exp(-dt * 7));
      const el = strip.current;
      if (!el) return;
      const pw = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth : window.innerWidth;
      const vw = el.parentElement?.clientWidth ?? window.innerWidth;
      // panel 0 is the entrance; shop i sits in panel i + 1 and is centred at t = i + 1.
      // On wide screens the shop slides away from the side where its card is docked.
      const side = (k: number) => (k <= 0 ? 0 : (k - 1) % 2 === 0 || k === SHOPS ? -1 : 1);
      const lo = Math.floor(t);
      const f = t - lo;
      const shift = vw >= 900 ? (side(lo) * (1 - f) + side(lo + 1) * f) * vw * 0.2 : 0;
      const x = (vw - pw) / 2 + shift - t * pw;
      el.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      if (far.current) far.current.style.transform = `translate3d(${(-t * pw * 0.18).toFixed(1)}px,0,0)`;
      const k = Math.round(t);
      el.querySelectorAll<HTMLElement>(".s2d-shop").forEach((n, i) => n.classList.toggle("active", i === k));
      threads.current?.querySelectorAll<SVGPathElement>("path[data-i]").forEach((p) => {
        const i = Number(p.dataset.i);
        const on = Math.min(1, Math.max(0, t - i - 0.35));
        p.style.opacity = String(0.15 + 0.85 * on);
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // far skyline of whitewashed houses
  const skyline = useMemo(() => {
    const r = rand(7);
    const rects: { x: number; y: number; w: number; h: number; lit: boolean }[] = [];
    for (let x = 0; x < 3000; ) {
      const w = 30 + r() * 60;
      const h = 40 + r() * 120;
      rects.push({ x, y: 400 - h, w, h, lit: r() < 0.5 });
      x += w + 2;
    }
    return rects;
  }, []);

  const panels = SHOPS + 2; // entrance + shops + one closing building

  return (
    <div className="s2d" aria-hidden="true">
      <div className="s2d-sky" />
      <div className="s2d-stars" />
      <div className="s2d-moon" />
      <div ref={far} className="s2d-layer s2d-far" style={{ top: "auto", bottom: "var(--ground)", height: "36%" }}>
        <svg viewBox="0 0 3000 400" preserveAspectRatio="xMinYMax slice">
          {skyline.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#1A2147" />
              {b.lit && <rect x={b.x + b.w * 0.4} y={b.y + 14} width={6} height={9} fill="#FFC27A" opacity=".8" />}
            </g>
          ))}
        </svg>
      </div>
      <div className="s2d-street" style={{ height: "var(--ground)" }} />
      <div ref={strip} className="s2d-layer" style={{ width: `calc(var(--pw) * ${panels})` }}>
        {/* entrance */}
        <div className="s2d-shop">
          <div className="s2d-gate" />
        </div>
        {items.map((it, i) => (
          <div key={it.slug} className="s2d-shop" style={{ "--neon": it.neon, "--in-top": it.top, "--in-bottom": it.bottom } as CSSProperties}>
            <div className="s2d-building" style={{ "--top": `${10 + ((i * 7) % 4) * 3}%` } as CSSProperties}>
              <Building seed={11 + i * 5} floors={3 + (i % 2)} />
              <div className="s2d-fascia">
                <span className="s2d-sign">{it.sign}</span>
              </div>
              <button
                type="button"
                tabIndex={-1}
                className={`s2d-arch ${it.arch}`}
                onClick={() => (it.kind === "empty" ? onEmpty() : onOpen(it.slug))}
                style={{ border: 0, padding: 0, cursor: "pointer" }}
              >
                <span className="s2d-detail">
                  <Detail kind={it.kind} />
                </span>
              </button>
            </div>
            <div className="s2d-pool" />
          </div>
        ))}
        <div className="s2d-shop">
          <div className="s2d-building" style={{ "--top": "16%" } as CSSProperties}>
            <Building seed={99} floors={4} />
          </div>
        </div>
        {/* red & blue threads between the signs */}
        <svg ref={threads} className="s2d-threads" viewBox={`0 0 ${panels * 100} 100`} preserveAspectRatio="none">
          {items.slice(0, -1).map((_, i) => {
            const x1 = (i + 1.5) * 100, x2 = (i + 2.5) * 100;
            return (
              <g key={i} fill="none" strokeLinecap="round">
                <path data-i={i} d={`M${x1} 20 Q ${(x1 + x2) / 2} 85 ${x2} 20`} stroke="#FF2E4D" strokeWidth="2" style={{ filter: "drop-shadow(0 0 3px #FF2E4D)" }} vectorEffect="non-scaling-stroke" />
                <path data-i={i} d={`M${x1} 8 Q ${(x1 + x2) / 2} 70 ${x2} 12`} stroke="#2E7BFF" strokeWidth="2" style={{ filter: "drop-shadow(0 0 3px #2E7BFF)" }} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
