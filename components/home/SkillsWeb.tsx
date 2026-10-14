"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { skills } from "@/data/lab";

/* Skills as a web of threads: hover or focus a node to light up what it connects to. */

const POS: Record<string, [number, number]> = {
  next: [170, 150],
  react: [320, 250],
  ts: [150, 330],
  three: [430, 120],
  gsap: [560, 200],
  tw: [300, 380],
  ui: [520, 340],
  django: [690, 150],
  python: [800, 270],
  ai: [900, 140],
  llm: [930, 350],
  data: [700, 380],
};
// taller layout for phones, so the labels stay readable
const POS_NARROW: Record<string, [number, number]> = {
  next: [130, 90],
  react: [330, 170],
  ts: [110, 290],
  three: [480, 80],
  gsap: [490, 300],
  tw: [270, 420],
  ui: [470, 500],
  django: [130, 560],
  python: [320, 650],
  ai: [500, 760],
  llm: [170, 820],
  data: [470, 920],
};
const COLORS: Record<string, string> = { web: "#2E7BFF", design: "#F4F1EA", back: "#FF2E4D", ai: "#FF2E4D" };

export default function SkillsWeb() {
  const [active, setActive] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const P = narrow ? POS_NARROW : POS;
  const fs = narrow ? 26 : 15;
  const [seen, setSeen] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const neighbours = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const [a, b] of skills.links) {
      if (!m.has(a)) m.set(a, new Set());
      if (!m.has(b)) m.set(b, new Set());
      m.get(a)!.add(b);
      m.get(b)!.add(a);
    }
    return m;
  }, []);

  const lit = (id: string) => !active || active === id || neighbours.get(active)?.has(id);

  return (
    <svg ref={ref} viewBox={narrow ? "0 0 600 1000" : "0 0 1000 470"} role="group" aria-label="Skills">
      <defs>
        <filter id="sk-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {skills.links.map(([a, b], i) => {
        const [x1, y1] = P[a];
        const [x2, y2] = P[b];
        const on = active ? active === a || active === b : true;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + 26;
        const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
        const len = Math.hypot(x2 - x1, y2 - y1) * 1.1;
        return (
          <g key={i} style={{ opacity: on ? 1 : 0.12, transition: "opacity .4s" }}>
            {active && on && <path d={d} fill="none" stroke="#FF2E4D" strokeWidth={5} filter="url(#sk-glow)" opacity={0.7} />}
            <path
              d={d}
              fill="none"
              stroke={i % 2 ? "#FF2E4D" : "#2E7BFF"}
              strokeWidth={active && on ? 2.2 : 1.2}
              strokeDasharray={len}
              strokeDashoffset={seen ? 0 : len}
              style={{ transition: `stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1) ${i * 0.05}s, stroke-width .3s` }}
            />
          </g>
        );
      })}
      {skills.nodes.map((n, i) => {
        const [x, y] = P[n.id];
        const on = lit(n.id);
        const c = COLORS[n.group];
        const w = n.label.length * fs * 0.7 + fs * 2.2;
        const h = fs * 2;
        return (
          <g
            key={n.id}
            className="skill-node"
            tabIndex={0}
            role="button"
            aria-pressed={active === n.id}
            aria-label={n.label}
            transform={`translate(${x} ${y})`}
            onMouseEnter={() => setActive(n.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(n.id)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(active === n.id ? null : n.id)}
            style={{ opacity: seen ? (on ? 1 : 0.28) : 0, transition: `opacity .5s ${seen && !active ? i * 0.06 : 0}s` }}
          >
            <circle className="ring" r={active === n.id ? 15 : 10} fill="#070A16" stroke={c} strokeWidth={1.6} style={{ transition: "r .3s" }} />
            <circle r={4} fill={c} />
            {active === n.id && <circle r={22} fill={c} opacity={0.18} filter="url(#sk-glow)" />}
            <rect x={-w / 2} y={18} width={w} height={h} rx={h / 2} fill="rgba(13,19,40,.92)" stroke="rgba(244,241,234,.16)" />
            <text y={18 + h * 0.66} textAnchor="middle" fill="#F4F1EA" style={{ font: `600 ${fs}px var(--font-body)` }}>
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
