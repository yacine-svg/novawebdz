"use client";

import { useEffect, useRef, useState } from "react";
import { links, site } from "@/data/site";
import { useLang } from "@/lib/i18n";
import { smoothScrollTo } from "@/components/providers/SmoothScroll";
import { Icon } from "@/components/ui/Icon";

const LAMPS = 12;

/** Giant name; the street lamps switch off one by one as you reach the bottom. */
export default function Footer() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const [off, setOff] = useState(0);
  const name = useRef<HTMLParagraphElement>(null);

  // size the giant name so it spans the full width, whatever the font metrics
  useEffect(() => {
    const p = name.current;
    const word = p?.firstElementChild as HTMLElement | null;
    if (!p || !word) return;
    const fit = () => {
      p.style.fontSize = "";
      const cs = getComputedStyle(p);
      const avail = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const w = word.getBoundingClientRect().width;
      if (w > 0 && avail > 0) p.style.fontSize = `${(parseFloat(cs.fontSize) * avail) / w}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(p);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the footer appears, 1 at the very bottom of the page
      const k = Math.min(1, Math.max(0, (vh - r.top) / Math.max(1, r.height)));
      setOff(Math.round(k * LAMPS));
      el.style.setProperty("--glow", String(0.85 - 0.75 * k));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <footer ref={ref} className="ft">
      <div className="lamps" aria-hidden="true">
        {Array.from({ length: LAMPS }, (_, i) => (
          <span key={i} className={`lamp${i < off ? " off" : ""}`}>
            <i />
          </span>
        ))}
      </div>
      <p ref={name} className="ft-name" aria-label="Nova Web Dz">
        <span>NOVA WEB DZ</span>
      </p>
      <p className="ft-off">{t.footer.off}</p>
      <div className="ft-row">
        <span>
          © {new Date().getFullYear()} {t.footer.made} · {t.footer.rights}
        </span>
        <span style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <a href={links.instagram} target="_blank" rel="noopener">
            @{site.instagram}
          </a>
          <a href={links.github} target="_blank" rel="noopener">
            GitHub
          </a>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo(0);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {t.footer.top}
            <Icon name="up" style={{ width: 16, height: 16 }} />
          </a>
        </span>
      </div>
    </footer>
  );
}
