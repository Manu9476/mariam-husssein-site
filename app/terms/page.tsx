import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import { getPageByPossibleSlugs, getSiteSettings } from "@/lib/api/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    getPageByPossibleSlugs(["terms", "terms-of-service", "terms-and-conditions"]),
  ]);

  const seo = resolveSeoCopy({
    title: page?.title || "Terms",
    excerpt: page?.excerpt,
    seo: page?.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const page = await getPageByPossibleSlugs([
    "terms",
    "terms-of-service",
    "terms-and-conditions",
  ]);

  if (!page) {
    return (
      <div className="container section-space">
        <EmptyState
          title="Terms page not published yet"
          description="Create a Sanity page with the slug terms, terms-of-service, or terms-and-conditions."
        />
      </div>
    );
  }

  return (
    <section className="section-space">
      <div className="container max-w-4xl space-y-6">
        <SectionHeading eyebrow="Legal" title={page.title} description={page.excerpt.replace(/<[^>]*>/g, "")} />
        <RichTextRenderer content={page.content} />
      </div>
    </section>
  );
}
