"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <main id="main" className="sec" style={{ minHeight: "100svh", display: "grid", alignContent: "center" }}>
      <div className="wrap">
        <p className="mono" style={{ color: "var(--red)" }}>
          404
        </p>
        <h1 className="sec-title" style={{ marginTop: 16, maxWidth: "14ch" }}>
          {t.notFound.title}
        </h1>
        <Link className="btn btn-red" href="/" style={{ marginTop: 30 }}>
          {t.notFound.back}
        </Link>
      </div>
    </main>
  );
}
