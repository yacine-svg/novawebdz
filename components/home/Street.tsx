"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { projects } from "@/data/projects";
import { useLang } from "@/lib/i18n";
import { useReducedMotion, useStreetMode, type StreetMode } from "@/lib/device";
import { ScrollTrigger, gsap } from "@/lib/gsap";
import { activeShopAt, publish, street as S, streetT, useStreetSnapshot } from "@/lib/streetStore";
import { smoothScrollTo } from "@/components/providers/SmoothScroll";
import { Icon } from "@/components/ui/Icon";
import ShopCard from "./ShopCard";
import Street2D from "./Street2D";

// the 3D street only loads in the browser, after the first paint
const StreetCanvas = dynamic(() => import("@/scene/StreetCanvas"), { ssr: false });

const SHOPS = projects.length + 1; // + the empty shop at the end of the street

/** If WebGL fails for any reason, fall back to the 2D street. */
class Fallback extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Street() {
  const { t } = useLang();
  const router = useRouter();
  const detected = useStreetMode();
  const [forced2d, setForced2d] = useState(false);
  const mode: StreetMode | null = forced2d ? "2d" : detected;
  const reduced = useReducedMotion();
  const snap = useStreetSnapshot();
  const section = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [last, setLast] = useState(0);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => setFinePointer(window.matchMedia("(pointer: fine)").matches), []);
  useEffect(() => {
    if (snap.active >= 0) setLast(snap.active);
  }, [snap.active]);

  // 2D street is ready as soon as it is mounted
  useEffect(() => {
    if (mode === "2d") {
      S.ready = true;
      publish({ ready: true });
    }
  }, [mode]);

  // scroll → progress along the street
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        S.progress = self.progress;
        publish({ active: activeShopAt(self.progress, SHOPS) });
        const tt = streetT(self.progress, SHOPS);
        if (hero.current) {
          const k = Math.min(1, tt / 0.45);
          hero.current.style.opacity = String(1 - k);
          hero.current.style.transform = `translateY(${-k * 60}px)`;
          hero.current.style.visibility = k >= 1 ? "hidden" : "visible";
        }
        bar.current?.style.setProperty("--p", self.progress.toFixed(4));
      },
    });
    S.progress = st.progress;
    publish({ active: activeShopAt(st.progress, SHOPS) });
    return () => st.kill();
  }, []);

  const scrollToShop = useCallback((i: number) => {
    const target = document.getElementById(i < projects.length ? `shop-${projects[i].slug}` : "shop-votre-commerce");
    if (target) smoothScrollTo(target);
  }, []);

  // ← → move between shops while the street is on screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const r = section.current?.getBoundingClientRect();
      if (!r || r.top > 10 || r.bottom < window.innerHeight - 10) return;
      e.preventDefault();
      const cur = Math.round(streetT(S.progress, SHOPS)) - 1;
      const next = cur + (e.key === "ArrowRight" ? 1 : -1);
      if (next < 0) smoothScrollTo(0); // back to the street entrance
      else scrollToShop(Math.min(SHOPS - 1, next));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollToShop]);

  const onEnter = useCallback(
    (slug: string) => {
      router.push(`/projets/${slug}`);
      window.setTimeout(() => {
        S.flight = null;
        publish({ flying: false });
      }, 1500);
    },
    [router],
  );
  const toContact = useCallback(() => {
    const c = document.getElementById("contact");
    if (c) smoothScrollTo(c);
  }, []);

  const shown = snap.active >= 0 ? snap.active : last;
  const dock = shown === SHOPS - 1 ? "right" : shown % 2 === 0 ? "right" : "left";

  return (
    <section
      ref={section}
      id="rue"
      className="rue"
      aria-label={t.street.label}
      style={{ "--segments": SHOPS } as CSSProperties}
    >
      {/* scroll targets: one per shop, for links, keyboard and "back to the street" */}
      {[...projects.map((p) => p.slug), "votre-commerce"].map((slug, i) => (
        <div key={slug} id={`shop-${slug}`} className="rue-anchor" style={{ top: `calc((100% - 100svh) * ${(i + 1) / SHOPS})` }} />
      ))}
      <div className="rue-stage">
        <p className="sr-only">{t.street.description}</p>
        {mode === "3d" && (
          <Fallback onError={() => setForced2d(true)}>
            <StreetCanvas onEnter={onEnter} onEmpty={toContact} reducedMotion={reduced} />
          </Fallback>
        )}
        {mode === "2d" && <Street2D reducedMotion={reduced} onOpen={(slug) => router.push(`/projets/${slug}`)} onEmpty={toContact} />}
        <div className="rue-shade" />

        <div ref={hero} className="hero">
          <p className="hero-kicker mono hero-reveal">{t.hero.kicker}</p>
          <h1 className="hero-name">
            <span className="first hero-reveal">{t.hero.first}</span>
            <span className="ln">
              <span>Yassine</span>
            </span>
            <span className="ln">
              <span>
                Sekhri<span className="dot">.</span>
              </span>
            </span>
          </h1>
          <div className="hero-bottom hero-reveal">
            <div>
              <p className="hero-pitch">{t.hero.pitch}</p>
            </div>
            <div>
              <p className="hero-sub">{t.hero.sub}</p>
              <div className="btn-row" style={{ marginTop: 18 }}>
                <button className="btn btn-red" type="button" onClick={() => scrollToShop(0)}>
                  {t.hero.cta}
                  <Icon name="down" />
                </button>
                <button className="btn btn-line" type="button" onClick={toContact}>
                  {t.hero.contact}
                </button>
              </div>
            </div>
            <p className="scroll-cue mono" aria-hidden="true">
              <i />
              {t.hero.scroll}
            </p>
          </div>
        </div>

        <ShopCard
          index={shown}
          visible={snap.active >= 0 && !snap.flying}
          dock={dock}
          show3dHint={mode === "3d" && finePointer && shown < projects.length}
          onPrev={() => scrollToShop(shown - 1)}
          onNext={() => scrollToShop(shown + 1)}
          onClaim={toContact}
        />

        <nav aria-label={t.street.index}>
          <ol className="shop-index">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <a
                  href={`#shop-${p.slug}`}
                  aria-current={snap.active === i}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToShop(i);
                  }}
                >
                  <span className="mono">{p.name}</span>
                  <i />
                </a>
              </li>
            ))}
            <li>
              <a
                href="#shop-votre-commerce"
                aria-current={snap.active === SHOPS - 1}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToShop(SHOPS - 1);
                }}
              >
                <span className="mono">{t.street.emptyTitle}</span>
                <i />
              </a>
            </li>
          </ol>
        </nav>
        <div ref={bar} className="rue-progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}

/** Lights switching on after the loader: drives the 3D intro and the hero reveal. */
export function switchOnStreet(reduced: boolean) {
  document.documentElement.classList.add("lit");
  if (reduced) {
    S.intro = 1;
    return;
  }
  gsap.to(S, { intro: 1, duration: 2.8, ease: "power1.inOut" });
}
