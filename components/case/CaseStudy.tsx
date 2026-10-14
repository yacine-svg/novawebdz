"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { getProject, nextProject, projects, type Project } from "@/data/projects";
import { useLang } from "@/lib/i18n";
import { useReducedMotion, useStreetMode } from "@/lib/device";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/home/Reveal";

const DeviceShowcase = dynamic(() => import("./DeviceShowcase"), { ssr: false });

/** Phone/laptop frames with screenshots: phones, weak devices, no WebGL. */
function DevicesFallback({ p }: { p: Project }) {
  const { t } = useLang();
  return (
    <div className="devices-2d">
      <div className="laptop2d">
        <div className="screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.screens.poster} alt={`${p.name}, ${t.caseStudy.preview}`} loading="eager" />
        </div>
      </div>
      <div className="phone2d">
        <div className="screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.screens.mobile ?? p.screens.poster} alt={`${p.name} mobile`} loading="lazy" />
        </div>
      </div>
    </div>
  );
}

function Clip({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  // clip-1.mp4 → clip-1.jpg: first frame, shown until the clip plays
  return <video ref={ref} src={src} poster={src.replace(/\.mp4$/, ".jpg")} muted loop playsInline preload="none" aria-label={label} controls={false} />;
}

export default function CaseStudy({ slug }: { slug: string }) {
  const { t, tx } = useLang();
  const p = getProject(slug)!;
  const next = nextProject(slug);
  const mode = useStreetMode();
  const reduced = useReducedMotion();
  const index = projects.findIndex((x) => x.slug === slug);

  const vars = {
    "--p-bg": p.colors.bg,
    "--p-ink": p.colors.ink,
    "--p-accent": p.colors.accent,
    "--n-bg": next.colors.bg,
    "--n-ink": next.colors.ink,
    "--n-accent": next.colors.accent,
  } as CSSProperties;

  return (
    <article style={vars}>
      <header className="cs-hero">
        <div>
          <Link className="cs-back mono" href={`/#shop-${p.slug}`}>
            <Icon name="arrowLeft" />
            {t.caseStudy.back}
          </Link>
          <p className="mono" style={{ marginTop: 28, opacity: 0.7 }}>
            {t.street.caseStudy} · {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
          <h1 className="cs-title">{p.name}</h1>
          <p className="cs-type">{tx(p.type)}</p>
          <p className="cs-tag">{tx(p.tagline)}</p>
          <dl className="cs-meta">
            <div>
              <dt className="mono">{t.caseStudy.city}</dt>
              <dd>{p.city}</dd>
            </div>
            <div>
              <dt className="mono">{t.caseStudy.year}</dt>
              <dd>{p.year}</dd>
            </div>
            <div>
              <dt className="mono">{t.caseStudy.tech}</dt>
              <dd>{p.tech.slice(0, 3).join(", ")}</dd>
            </div>
          </dl>
          <div className="btn-row" style={{ marginTop: 30 }}>
            <a className="btn cs-btn" href={p.url} target="_blank" rel="noopener">
              {t.caseStudy.live}
              <Icon name="external" />
            </a>
          </div>
        </div>
        <div>{mode === "3d" ? <DeviceShowcase project={p} reduced={reduced} /> : mode === "2d" ? <DevicesFallback p={p} /> : <div className="devices" />}</div>
      </header>

      <section className="sec cs-body" id="main-content">
        <div className="wrap">
          <div className="cs-cols">
            <Reveal className="cs-block">
              <p className="mono num">01 — {t.caseStudy.problem}</p>
              <h2>{t.caseStudy.problem}</h2>
              <p>{tx(p.problem)}</p>
            </Reveal>
            <Reveal className="cs-block" delay={0.1}>
              <p className="mono num">02 — {t.caseStudy.built}</p>
              <h2>{t.caseStudy.built}</h2>
              <p>{tx(p.built)}</p>
            </Reveal>
          </div>

          <Reveal className="cs-block" style={{ marginTop: "clamp(70px, 9vw, 130px)" }}>
            <p className="mono num">03 — {t.caseStudy.standouts}</p>
            <h2>{t.caseStudy.standouts}</h2>
          </Reveal>
          <div className="stand-grid">
            {p.standouts.map((s, i) => (
              <Reveal key={i} className="stand" delay={i * 0.08}>
                <div className="stand-media">
                  {s.media ? (
                    <Clip src={s.media} label={tx(s.title)} />
                  ) : (
                    <div className="stand-ph">
                      <i>
                        <Icon name="play" style={{ width: 18, height: 18, color: "var(--p-accent)" }} />
                      </i>
                      <span className="mono">{t.caseStudy.mediaSoon}</span>
                    </div>
                  )}
                </div>
                <div className="stand-body">
                  <p className="mono" style={{ color: "var(--p-accent)" }}>
                    0{i + 1}
                  </p>
                  <h3>{tx(s.title)}</h3>
                  <p>{tx(s.text)}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="cs-cols" style={{ marginTop: "clamp(70px, 9vw, 130px)" }}>
            <Reveal className="cs-block">
              <p className="mono num">04 — {t.caseStudy.design}</p>
              <h2>{t.caseStudy.design}</h2>
              <p>{tx(p.design)}</p>
              <p className="mono" style={{ marginTop: 30, color: "var(--faint)" }}>
                {t.caseStudy.colors}
              </p>
              <div className="swatches">
                {p.palette.map((c) => (
                  <div className="swatch" key={c.hex}>
                    <i style={{ background: c.hex }} />
                    <div>
                      <b>{c.name}</b>
                      <span className="mono" style={{ color: "var(--faint)" }}>
                        {c.hex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal className="cs-block" delay={0.1}>
              <p className="mono num">05 — {t.caseStudy.fonts}</p>
              <h2>{t.caseStudy.fonts}</h2>
              <div className="fonts-list">
                {p.fonts.map((f) => (
                  <div key={f.name}>
                    <b>{f.name}</b>
                    <span className="mono" style={{ color: "var(--faint)" }}>
                      {tx(f.role)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mono" style={{ marginTop: 30, color: "var(--faint)" }}>
                {t.caseStudy.tech}
              </p>
              <div className="sc-tech">
                {p.tech.map((x) => (
                  <span className="chip" key={x}>
                    {x}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Link className="cs-next" href={`/projets/${next.slug}`}>
        <span className="mono" style={{ opacity: 0.7 }}>
          {t.caseStudy.next}
        </span>
        <b>{next.name}</b>
        <span style={{ display: "block", marginTop: 14, opacity: 0.8 }}>{tx(next.type)}</span>
        <Icon name="arrow" className="arrow" />
      </Link>
    </article>
  );
}
