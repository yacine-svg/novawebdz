"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { links } from "@/data/site";
import { useLang } from "@/lib/i18n";
import { smoothScrollTo } from "@/components/providers/SmoothScroll";
import { Icon, Mark } from "@/components/ui/Icon";

const SECTIONS = [
  ["rue", "projects"],
  ["apropos", "about"],
  ["labo", "lab"],
  ["methode", "process"],
  ["contact", "contact"],
] as const;

export default function Header() {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const home = pathname === "/";
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > (home ? window.innerHeight * 0.6 : 40));
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [home]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (!home) return; // let Next navigate to /#id
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    smoothScrollTo(el);
    history.replaceState(null, "", `#${id}`);
  };

  const wa = links.whatsapp(t.contact.waHello);

  return (
    <>
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <header className={`hd${solid || open ? " solid" : ""}`}>
        <Link className="logo" href="/" aria-label="Nova Web Dz">
          <Mark />
          <div>
            <b>Nova Web Dz</b>
            <span>STUDIO WEB</span>
          </div>
        </Link>
        <nav className="nav" aria-label="Navigation">
          {SECTIONS.map(([id, key]) => (
            <Link key={id} href={`/#${id}`} onClick={go(id)}>
              {t.nav[key]}
            </Link>
          ))}
        </nav>
        <div className="hd-tools">
          <button className="lang" type="button" onClick={() => setLang(lang === "fr" ? "en" : "fr")} aria-label={t.nav.switchLabel}>
            {lang === "fr" ? "EN" : "FR"}
          </button>
          <a className="btn btn-red btn-sm hd-wa" href={wa} target="_blank" rel="noopener">
            <Icon name="whatsapp" />
            WhatsApp
          </a>
          <button
            className="burger"
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen(!open)}
          >
            <i />
            <i />
          </button>
        </div>
      </header>
      <div className={`menu${open ? " open" : ""}`} id="menu" role="dialog" aria-modal="true" aria-label={t.nav.menu} inert={!open} data-lenis-prevent>
        <nav aria-label="Navigation mobile">
          {SECTIONS.map(([id, key], i) => (
            <Link key={id} href={`/#${id}`} onClick={go(id)}>
              <span>0{i + 1}</span>
              {t.nav[key]}
            </Link>
          ))}
        </nav>
        <a className="btn btn-red" href={wa} target="_blank" rel="noopener">
          <Icon name="whatsapp" />
          {t.contact.whatsapp}
        </a>
      </div>
    </>
  );
}
