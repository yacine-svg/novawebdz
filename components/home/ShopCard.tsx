"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { projects } from "@/data/projects";
import { links } from "@/data/site";
import { useLang } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";

type Props = {
  index: number; // shop index, projects.length = the empty shop
  visible: boolean;
  dock: "left" | "right";
  show3dHint: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClaim: () => void;
};

export default function ShopCard({ index, visible, dock, show3dHint, onPrev, onNext, onClaim }: Props) {
  const { t, tx } = useLang();
  const total = projects.length + 1;
  const p = projects[index];
  const n = String(index + 1).padStart(2, "0");
  const of = String(total).padStart(2, "0");

  const nav = (
    <div className="sc-nav">
      <button className="icon-btn" type="button" onClick={onPrev} aria-label={t.street.prev} disabled={index <= 0}>
        <Icon name="arrowLeft" />
      </button>
      <button className="icon-btn" type="button" onClick={onNext} aria-label={t.street.next} disabled={index >= total - 1}>
        <Icon name="arrow" />
      </button>
    </div>
  );

  if (!p) {
    return (
      <aside className={`shop-card${visible ? " show" : ""}`} data-dock={dock} style={{ "--accent": "#FF2E4D" } as CSSProperties} aria-live="polite" aria-hidden={!visible} inert={!visible}>
        <div className="sc-top mono">
          <span>
            {t.street.shop} {n} / {of}
          </span>
          <span>{t.street.emptyType}</span>
        </div>
        <h2 className="sc-name">{t.street.emptyTitle}</h2>
        <p className="sc-tag" style={{ display: "block" }}>
          {t.street.emptyText}
        </p>
        <div className="sc-actions">
          <button className="btn btn-red btn-sm" type="button" onClick={onClaim}>
            {t.street.emptyCta}
            <Icon name="arrow" />
          </button>
          <a className="btn btn-line btn-sm" href={links.whatsapp(t.street.emptyWaText)} target="_blank" rel="noopener">
            <Icon name="whatsapp" />
            {t.street.emptyWa}
          </a>
          {nav}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`shop-card${visible ? " show" : ""}`}
      data-dock={dock}
      style={{ "--accent": p.colors.neon } as CSSProperties}
      aria-live="polite"
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="sc-top mono">
        <span>
          {t.street.shop} {n} / {of}
        </span>
        <span>{p.city}</span>
      </div>
      <h2 className="sc-name">{p.name}</h2>
      <p className="sc-type">{tx(p.type)}</p>
      <p className="sc-tag">{tx(p.tagline)}</p>
      <ul className="sc-list" aria-label={t.street.features}>
        {p.features.map((f, i) => (
          <li key={i}>{tx(f)}</li>
        ))}
      </ul>
      <div className="sc-tech" aria-label={t.street.tech}>
        {p.tech.map((x) => (
          <span className="chip" key={x}>
            {x}
          </span>
        ))}
      </div>
      <div className="sc-actions">
        <a className="btn btn-light btn-sm" href={p.url} target="_blank" rel="noopener">
          {t.street.visit}
          <Icon name="external" />
        </a>
        <Link className="btn btn-line btn-sm" href={`/projets/${p.slug}`}>
          {t.street.caseStudy}
          <Icon name="arrow" />
        </Link>
        {nav}
      </div>
      {show3dHint && (
        <p className="enter-hint mono">
          <i />
          {t.street.enter}
        </p>
      )}
    </aside>
  );
}
