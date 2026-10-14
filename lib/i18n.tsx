"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Dict, type L, type Lang } from "@/locales/translations";

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void; tx: (v: L) => string };

const LangContext = createContext<Ctx | null>(null);
const KEY = "nwdz:lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* storage blocked: stay in French */
    }
    if (saved === "en" || saved === "fr") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, t: translations[lang], setLang, tx: (v: L) => v[lang] }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const c = useContext(LangContext);
  if (!c) throw new Error("useLang must be used inside <LangProvider>");
  return c;
}
