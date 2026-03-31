import type { Metadata } from "next";

import { NewsletterForm } from "@/components/forms/newsletter-form";
import { PostCard } from "@/components/content/post-card";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getCategories,
  getLatestPosts,
  getPageBySlug,
  getSiteSettings,
} from "@/lib/api/wordpress";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";

function getCategoryLabels(ids: number[], categoryMap: Map<number, string>) {
  return ids.map((id) => categoryMap.get(id)).filter(Boolean) as string[];
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("newsletter"),
  ]);

  const seo = resolveSeoCopy({
    title: page?.title || "Newsletter",
    excerpt: page?.excerpt,
    seo: page?.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image,
    path: "/newsletter",
  });
}

export default async function NewsletterPage() {
  const [settings, page, latestPosts, categories] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("newsletter"),
    getLatestPosts(2),
    getCategories(),
  ]);

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <>
      <section className="section-space">
        <div className="container grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-5">
            <SectionHeading
              eyebrow={settings.newsletter.eyebrow || "Newsletter 💌"}
              title={page?.title || settings.newsletter.title}
              description={
                page?.excerpt.replace(/<[^>]*>/g, "") || settings.newsletter.description
              }
            />
            <p className="max-w-xl text-sm text-muted-foreground">
              {settings.newsletter.disclaimer}
            </p>
          </div>
          <div className="editorial-panel p-6 md:p-7">
            <NewsletterForm
              placeholder={settings.newsletter.placeholder}
              buttonLabel={settings.newsletter.buttonLabel}
            />
          </div>
        </div>
      </section>

      {latestPosts.length ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow="Recent reading"
              title="A small sample from the journal."
              description="Use the newsletter page to introduce what subscribers can expect."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {latestPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  categoryLabels={getCategoryLabels(post.categories, categoryMap)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
