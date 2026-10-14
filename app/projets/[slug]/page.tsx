import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/projects";
import CaseStudy from "@/components/case/CaseStudy";
import Footer from "@/components/layout/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const title = `${p.name} · ${p.type.fr}`;
  return {
    title,
    description: p.tagline.fr,
    alternates: { canonical: `/projets/${p.slug}` },
    openGraph: {
      title,
      description: p.tagline.fr,
      url: `/projets/${p.slug}`,
      images: [{ url: `/og/${p.slug}.jpg`, width: 1200, height: 630, alt: p.name }],
    },
    twitter: { card: "summary_large_image", title, description: p.tagline.fr, images: [`/og/${p.slug}.jpg`] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return (
    <>
      <main id="main">
        <CaseStudy slug={slug} />
      </main>
      <Footer />
    </>
  );
}
