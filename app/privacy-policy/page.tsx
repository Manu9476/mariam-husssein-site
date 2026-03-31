import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import { getPageByPossibleSlugs, getSiteSettings } from "@/lib/api/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    getPageByPossibleSlugs(["privacy-policy", "privacy"]),
  ]);

  const seo = resolveSeoCopy({
    title: page?.title || "Privacy Policy",
    excerpt: page?.excerpt,
    seo: page?.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image,
    path: "/privacy-policy",
  });
}

export default async function PrivacyPolicyPage() {
  const page = await getPageByPossibleSlugs(["privacy-policy", "privacy"]);

  if (!page) {
    return (
      <div className="container section-space">
        <EmptyState
          title="Privacy policy not published yet"
          description="Create a Sanity page with the slug privacy-policy or privacy."
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
