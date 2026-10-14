"use client";

import { useRef } from "react";
import { useLang } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";

/* Line drawings for each step (desktop only): the conversation, the mockup, the code, the launch. */
const art = (G: string) => [
  // 01 Découverte: a WhatsApp conversation
  <g key="a" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 26h118a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H52l-18 14V84H20A12 12 0 0 1 8 72V38a12 12 0 0 1 12-12z" />
    <path d="M30 46h90M30 62h64" opacity=".6" />
    <path d="M102 100h118a12 12 0 0 1 12 12v30a12 12 0 0 1-12 12h-14v14l-18-14h-86a12 12 0 0 1-12-12v-30a12 12 0 0 1 12-12z" />
    <path d="M114 118h96M114 134h58" opacity=".6" />
    <circle cx="196" cy="40" r="16" />
    <path d="M190 40l4 4 8-9" />
  </g>,
  // 02 Design: phone mockup, swatches, type
  <g key="b" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="10" width="86" height="160" rx="16" />
    <path d="M48 20h26" />
    <rect x="30" y="36" width="62" height="40" rx="6" opacity=".7" />
    <path d="M30 90h50M30 102h36" opacity=".6" />
    <rect x="30" y="118" width="40" height="14" rx="7" />
    <circle cx="140" cy="44" r="16" fill="rgba(255,46,77,.25)" />
    <circle cx="180" cy="44" r="16" fill="rgba(46,123,255,.25)" />
    <circle cx="220" cy="44" r="16" />
    <text x="132" y="140" fontFamily="var(--font-display)" fontSize="64" fontWeight="800" fill={G} stroke="none" opacity=".85">Aa</text>
  </g>,
  // 03 Développement: code window
  <g key="c" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="14" width="220" height="150" rx="14" />
    <path d="M10 40h220" />
    <circle cx="28" cy="27" r="3" /> <circle cx="42" cy="27" r="3" /> <circle cx="56" cy="27" r="3" />
    <path d="M44 72l-18 16 18 16M196 72l18 16-18 16M132 64l-24 52" />
    <path d="M40 132h64M114 132h40M40 148h28" opacity=".6" />
  </g>,
  // 04 Lancement: live site, rising curve, spark
  <g key="d" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="20" width="160" height="120" rx="12" />
    <path d="M10 42h160" />
    <circle cx="150" cy="31" r="4" fill="#3ddc84" stroke="none" />
    <path d="M26 120l30-22 22 12 34-34 28 10" />
    <path d="M140 86l12-12M152 74v14M152 74h-14" />
    <path d="M206 52c1.3 9.6 7.2 15.6 17 17-9.8 1.4-15.7 7.3-17 17-1.3-9.7-7.2-15.6-17-17 9.8-1.4 15.7-7.4 17-17z" fill="rgba(255,46,77,.25)" />
    <path d="M60 162h120" opacity=".5" />
  </g>,
];

/* Four steps, scrolled sideways and pinned on desktop, stacked on phones. */
export default function Process() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - (pin.current!.clientWidth - 2 * parseFloat(getComputedStyle(pin.current!).paddingLeft || "0")));
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="methode" ref={root} className="sec process" aria-labelledby="process-h">
      <div ref={pin} className="process-pin wrap">
        <div className="process-head">
          <p className="kicker mono">
            <b>04</b> {t.process.kicker}
          </p>
          <h2 id="process-h" className="sec-title">
            {t.process.title}
          </h2>
        </div>
        <div ref={track} className="process-track">
          {t.process.steps.map((s, i) => (
            <article className="step" key={s.title}>
              <span className="step-n" aria-hidden="true">
                0{i + 1}
              </span>
              <svg className="step-art" viewBox="0 0 240 180" aria-hidden="true">
                {art(i % 2 ? "#2E7BFF" : "#FF2E4D")[i]}
              </svg>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ul>
                {s.out.map((o) => (
                  <li className="chip" key={o}>
                    {o}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
