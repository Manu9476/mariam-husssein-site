import type { Metadata } from "next";

import { ResourceCard } from "@/components/content/resource-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPageByPossibleSlugs, getResources, getSiteSettings } from "@/lib/api/wordpress";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    getPageByPossibleSlugs(["resources", "services"]),
  ]);

  const seo = resolveSeoCopy({
    title: page?.title || "Resources",
    excerpt: page?.excerpt,
    seo: page?.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image,
    path: "/resources",
  });
}

export default async function ResourcesPage() {
  const [settings, page, resources] = await Promise.all([
    getSiteSettings(),
    getPageByPossibleSlugs(["resources", "services"]),
    getResources(),
  ]);
  const copy = settings.pageCopy.resources;

  return (
    <>
      <section className="section-space">
        <div className="container space-y-6">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={page?.title || copy.title || "Curated offers, resources, and thoughtful tools."}
            description={
              page?.excerpt?.replace(/<[^>]*>/g, "") ||
              copy.description
            }
          />
          {page?.content ? <RichTextRenderer content={page.content} /> : null}
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container">
          {resources.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={copy.emptyTitle || "No resources published yet"}
              description={copy.emptyDescription || "Add resources in Studio and they will appear here."}
            />
          )}
        </div>
      </section>
    </>
  );
}
