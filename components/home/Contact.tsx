"use client";

import { useState, type FormEvent } from "react";
import { links, site } from "@/data/site";
import { useLang } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import Reveal from "./Reveal";

export default function Contact() {
  const { t } = useLang();
  const f = t.contact.form;
  const [errors, setErrors] = useState<{ name?: boolean; need?: boolean }>({});

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const business = String(data.get("business") || "");
    const need = String(data.get("need") || "").trim();
    const next = { name: name.length < 2, need: need.length < 3 };
    setErrors(next);
    if (next.name) return (e.currentTarget.elements.namedItem("name") as HTMLInputElement).focus();
    if (next.need) return (e.currentTarget.elements.namedItem("need") as HTMLTextAreaElement).focus();
    window.open(links.whatsapp(f.message(name, business, need)), "_blank", "noopener");
  };

  const rows = [
    { href: links.whatsapp(t.contact.waHello), label: "WhatsApp", value: site.phoneDisplay, icon: "whatsapp" as const, ext: true },
    links.email ? { href: links.email, label: t.contact.email, value: site.email, icon: "mail" as const, ext: false } : null,
    { href: links.instagram, label: t.contact.instagram, value: `@${site.instagram}`, icon: "instagram" as const, ext: true },
    { href: links.github, label: t.contact.github, value: `github.com/${site.github}`, icon: "github" as const, ext: true },
  ].filter(Boolean) as { href: string; label: string; value: string; icon: "whatsapp" | "mail" | "instagram" | "github"; ext: boolean }[];

  return (
    <section id="contact" className="sec contact" aria-labelledby="contact-h">
      <div className="wrap contact-grid">
        <div>
          <Reveal>
            <p className="kicker mono">
              <b>05</b> {t.contact.kicker}
            </p>
            <h2 id="contact-h" className="cta-title" style={{ marginTop: 18 }}>
              <span>{t.contact.title1}</span>
              <span>{t.contact.title2}</span>
            </h2>
            <p className="sec-lead" style={{ marginTop: 22 }}>
              {t.contact.sub}
            </p>
            <div className="btn-row" style={{ marginTop: 26 }}>
              <a className="btn btn-red" href={links.whatsapp(t.contact.waHello)} target="_blank" rel="noopener">
                <Icon name="whatsapp" />
                {t.contact.whatsapp}
              </a>
            </div>
          </Reveal>
          <Reveal className="contact-links" delay={0.1}>
            {rows.map((r) => (
              <a key={r.label} href={r.href} target={r.ext ? "_blank" : undefined} rel={r.ext ? "noopener" : undefined}>
                <span className="mono">{r.label}</span>
                <b>{r.value}</b>
              </a>
            ))}
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <form className="form" onSubmit={submit} noValidate>
            <h3>{f.title}</h3>
            <label className="field">
              <span>{f.name}</span>
              <input
                className="input"
                name="name"
                autoComplete="name"
                placeholder={f.namePh}
                aria-invalid={errors.name || undefined}
                aria-describedby={errors.name ? "err-name" : undefined}
                onInput={() => errors.name && setErrors({ ...errors, name: false })}
              />
              {errors.name && (
                <span id="err-name" className="err">
                  {f.required}
                </span>
              )}
            </label>
            <label className="field">
              <span>{f.business}</span>
              <select className="input" name="business" defaultValue={f.types[0]}>
                {f.types.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{f.need}</span>
              <textarea
                className="input"
                name="need"
                rows={4}
                placeholder={f.needPh}
                aria-invalid={errors.need || undefined}
                aria-describedby={errors.need ? "err-need" : undefined}
                onInput={() => errors.need && setErrors({ ...errors, need: false })}
              />
              {errors.need && (
                <span id="err-need" className="err">
                  {f.required}
                </span>
              )}
            </label>
            <button className="btn btn-blue" type="submit">
              <Icon name="whatsapp" />
              {f.submit}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
