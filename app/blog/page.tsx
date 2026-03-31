import type { Metadata } from "next";

import { CategoryPills } from "@/components/content/category-pills";
import { Pagination } from "@/components/content/pagination";
import { PostCard } from "@/components/content/post-card";
import { SearchInput } from "@/components/content/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import {
  getCategories,
  getCategoryBySlug,
  getPosts,
  getSiteSettings,
} from "@/lib/api/wordpress";
import { buildMetadata } from "@/lib/seo";

function getCategoryLabels(ids: number[], categoryMap: Map<number, string>) {
  return ids.map((id) => categoryMap.get(id)).filter(Boolean) as string[];
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildMetadata(settings, {
    title: "Journal",
    description:
      "An editorial collection of essays, reflections, and thoughtful writing by Mariam Husssein.",
    path: "/blog",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page || 1);
  const query = params.query?.trim() || "";
  const categorySlug = params.category?.trim() || "";

  const [settings, categories, activeCategory] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getCategoryBySlug(categorySlug),
  ]);

  const postData = await getPosts({
    page: currentPage,
    search: query || undefined,
    categoryId: activeCategory?.id,
  });

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <>
      <section className="section-space">
        <div className="container space-y-6">
          <SectionHeading
            eyebrow="Journal"
            title="Stories, lessons, and notes with an editorial rhythm."
            description="Search by keyword, filter by category, and manage every article directly from WordPress."
          />
          <SearchInput defaultValue={query} />
          <CategoryPills
            categories={categories}
            activeSlug={activeCategory?.slug}
            query={query}
          />
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container space-y-6">
          {postData.items.length ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {postData.items.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    categoryLabels={getCategoryLabels(post.categories, categoryMap)}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={postData.totalPages}
                query={query || undefined}
                category={activeCategory?.slug}
              />
            </>
          ) : (
            <EmptyState
              title="No posts match this search yet"
              description="Try a broader keyword or publish new posts in WordPress to populate the journal."
            />
          )}
        </div>
      </section>

      <NewsletterSection settings={settings} />
    </>
  );
}
