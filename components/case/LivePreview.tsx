"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { useLang } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";

export type PreviewView = "desktop" | "mobile";

/* The live site at its real size (1280 × 800 or 390 × 844), scaled down to fit the screen,
   so visitors can click around a demo without leaving the portfolio. */
const FRAME = { desktop: { w: 1280, h: 800 }, mobile: { w: 390, h: 844 } };

type LenisLike = { stop?: () => void; start?: () => void };

export default function LivePreview({ project, view, onView, onClose }: { project: Project; view: PreviewView | null; onView: (v: PreviewView) => void; onClose: () => void }) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const open = view !== null;
  const f = FRAME[view ?? "desktop"];

  // fit the frame in the window
  useEffect(() => {
    if (!open) return;
    const fit = () => setScale(Math.min(1, (window.innerWidth - 32) / f.w, (window.innerHeight - 150) / f.h));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open, f.w, f.h]);

  // focus, Escape, page scroll locked while open
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    closeBtn.current?.focus();
    const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
    lenis?.stop?.();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start?.();
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => setLoaded(false), [view]);

  if (!open) return null;
  const poster = view === "mobile" ? (project.screens.mobile ?? project.screens.poster) : project.screens.poster;
  return (
    <div className="lp" role="dialog" aria-modal="true" aria-label={`${t.caseStudy.tryLive} : ${project.name}`} data-lenis-prevent onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lp-bar">
        <div className="lp-views" role="group" aria-label={t.caseStudy.tryLive}>
          {(["desktop", "mobile"] as const).map((v) => (
            <button key={v} type="button" className="chip" aria-pressed={view === v} onClick={() => onView(v)}>
              {v === "desktop" ? t.caseStudy.desktop : t.caseStudy.mobile}
            </button>
          ))}
        </div>
        <a className="lp-link mono" href={project.url} target="_blank" rel="noopener">
          {project.url.replace(/^https?:\/\//, "")}
          <Icon name="external" />
        </a>
        <button ref={closeBtn} type="button" className="lp-close" onClick={onClose} aria-label={t.caseStudy.close}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="lp-stage" style={{ width: f.w * scale, height: f.h * scale }}>
        <div className="lp-frame" style={{ width: f.w, height: f.h, transform: `scale(${scale})`, backgroundImage: `url(${poster})`, borderRadius: (view === "mobile" ? 34 : 12) / scale }}>
          <iframe key={view} src={project.url} title={`${project.name} (${view === "mobile" ? t.caseStudy.mobile : t.caseStudy.desktop})`} onLoad={() => setLoaded(true)} style={{ opacity: loaded ? 1 : 0 }} />
          {!loaded && <span className="lp-loading mono">{t.caseStudy.loading}</span>}
        </div>
      </div>
    </div>
  );
}
