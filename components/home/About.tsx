"use client";

import { site } from "@/data/site";
import { useLang } from "@/lib/i18n";
import Reveal from "./Reveal";
import SkillsWeb from "./SkillsWeb";

export default function About() {
  const { t } = useLang();
  return (
    <section id="apropos" className="sec about" aria-labelledby="about-h">
      <div className="wrap about-grid">
        <Reveal>
          <figure className="portrait" style={{ margin: 0 }}>
            {site.portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.portrait} alt={t.about.portraitAlt} loading="lazy" />
            ) : (
              <div className="portrait-ph" role="img" aria-label={t.about.portraitAlt}>
                <svg viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="50" cy="40" r="20" />
                  <path d="M12 116c4-26 20-40 38-40s34 14 38 40" />
                </svg>
                <span className="mono">{t.about.portrait}</span>
              </div>
            )}
          </figure>
          <dl className="facts">
            {t.about.facts.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <div>
          <Reveal>
            <p className="kicker mono">
              <b>02</b> {t.about.kicker}
            </p>
            <h2 id="about-h" className="sec-title" style={{ marginTop: 18 }}>
              {t.about.title}
            </h2>
          </Reveal>
          <Reveal className="about-text" delay={0.1}>
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
          </Reveal>
        </div>
      </div>
      <div className="wrap">
        <Reveal className="skills">
          <div className="skills-head">
            <b>{t.about.skillsTitle}</b>
            <span>{t.about.skillsHint}</span>
          </div>
          <SkillsWeb />
        </Reveal>
      </div>
    </section>
  );
}
