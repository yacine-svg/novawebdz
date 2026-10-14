import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { translations } from "@/locales/translations";
import { LangProvider } from "@/lib/i18n";
import SmoothScroll, { LenisBridge } from "@/components/providers/SmoothScroll";
import Header from "@/components/layout/Header";
import Ambient from "@/components/layout/Ambient";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  variable: "--font-display-face",
  display: "swap",
});
const body = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-body-face", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });

const t = translations.fr;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: t.meta.title, template: `%s · ${site.studio}` },
  description: t.meta.description,
  applicationName: site.studio,
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    alternateLocale: ["en_US"],
    siteName: site.studio,
    title: t.meta.title,
    description: t.meta.description,
    url: "/",
    images: [{ url: "/og/site.jpg", width: 1200, height: 630, alt: t.meta.title }],
  },
  twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: ["/og/site.jpg"] },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#070A16",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* lets CSS hide elements that animate in, only when JavaScript runs */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <LangProvider>
          <SmoothScroll>
            <LenisBridge />
            <Header />
            <Ambient />
            {children}
          </SmoothScroll>
        </LangProvider>
      </body>
    </html>
  );
}
