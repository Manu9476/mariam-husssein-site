import type { Metadata } from "next";

import { FeaturedPostCard } from "@/components/content/featured-post-card";
import { PostCard } from "@/components/content/post-card";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getCategories,
  getLatestPosts,
  getPageBySlug,
  getSiteSettings,
} from "@/lib/api/wordpress";
import { getLetterCategoryIds } from "@/lib/letters";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import type { ContentId } from "@/types/content";

function getCategoryLabels(ids: ContentId[], categoryMap: Map<ContentId, string>) {
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
  const [settings, page, categories] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("newsletter"),
    getCategories(),
  ]);
  const copy = settings.pageCopy.newsletterPage;

  const letterCategoryIds = getLetterCategoryIds(categories);
  const latestPosts = await getLatestPosts(6, undefined, {
    excludeCategoryIds: letterCategoryIds,
  });
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const featuredPost = latestPosts[0] ?? null;
  const remainingPosts = latestPosts.slice(1);

  return (
    <>
      {featuredPost ? (
        <section className="section-space">
          <div className="container">
            <FeaturedPostCard
              post={featuredPost}
              categoryLabels={getCategoryLabels(featuredPost.categories, categoryMap)}
              label={copy.previewEyebrow || "Latest issue"}
            />
          </div>
        </section>
      ) : null}

      {!featuredPost && page ? (
        <section className="section-space">
          <div className="container">
            <SectionHeading
              eyebrow={copy.eyebrow}
              title={page.title}
              description={page.excerpt?.replace(/<[^>]*>/g, "") || copy.description}
            />
          </div>
        </section>
      ) : null}

      {remainingPosts.length ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow={copy.previewEyebrow}
              title={copy.previewTitle || "More from the newsletter."}
              description={
                copy.previewDescription ||
                "A growing archive of published notes, reflections, and thoughtful updates."
              }
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {remainingPosts.map((post) => (
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
