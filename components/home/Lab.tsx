"use client";

import type { CSSProperties } from "react";
import { lab } from "@/data/lab";
import { useLang } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import Reveal from "./Reveal";

const KEPT = new Set([2, 5, 8]);

/** A small film strip for the video-summary project: frames, the scenes the agents kept, a timeline. */
function SceneStrip({ label, agents }: { label: string; agents: readonly string[] }) {
  return (
    <div className="scene-strip" aria-hidden="true">
      <div className="ss-frames">
        {Array.from({ length: 10 }, (_, k) => (
          <i key={k} className={KEPT.has(k) ? (k === 5 ? "kept red" : "kept") : ""} style={{ "--h": `${(k * 37) % 360}` } as CSSProperties} />
        ))}
      </div>
      <div className="ss-line">
        {[...KEPT].map((k) => (
          <b key={k} style={{ left: `${(k + 0.5) * 10}%` }} />
        ))}
      </div>
      <div className="ss-foot mono">
        <span>{label}</span>
        <span>3 / 10</span>
      </div>
      <ol className="ss-agents mono">
        {agents.map((a, k) => (
          <li key={a}>
            <em>{String(k + 1).padStart(2, "0")}</em> {a}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Lab() {
  const { t, tx } = useLang();
  return (
    <section id="labo" className="sec lab" aria-labelledby="lab-h">
      <div className="wrap">
        <Reveal className="lab-head">
          <div>
            <p className="kicker mono">
              <b>03</b> {t.lab.kicker}
            </p>
            <h2 id="lab-h" className="sec-title" style={{ marginTop: 18 }}>
              {t.lab.title}
            </h2>
          </div>
          <p className="sec-lead">{t.lab.intro}</p>
        </Reveal>
        <div className="lab-grid">
          {lab.map((p, i) => (
            <Reveal key={i} delay={i * 0.08} style={{ display: "flex" }}>
              <a className="lab-card" href={p.repo} target="_blank" rel="noopener" style={{ flex: 1 }}>
                <p className="mono status">{tx(p.status)}</p>
                <h3>{tx(p.title)}</h3>
                <p>{tx(p.text)}</p>
                {i === 0 && <SceneStrip label={t.lab.viz} agents={t.lab.vizAgents} />}
                <div className="sc-tech">
                  {p.tags.map((x) => (
                    <span className="chip" key={x}>
                      {x}
                    </span>
                  ))}
                </div>
                <span className="go">
                  <Icon name="github" />
                  {t.lab.repo}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
