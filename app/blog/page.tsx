import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
import {
  filterNonLetterCategories,
  getLetterCategoryIds,
  getLetterCollectionByCategorySlug,
} from "@/lib/letters";
import { buildMetadata } from "@/lib/seo";
import type { ContentId } from "@/types/content";

function getCategoryLabels(ids: ContentId[], categoryMap: Map<ContentId, string>) {
  return ids.map((id) => categoryMap.get(id)).filter(Boolean) as string[];
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildMetadata(settings, {
    title: "Notes",
    description:
      "An editorial collection of notes, essays, and thoughtful writing by Mariam Husssein.",
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

  const letterCollection = getLetterCollectionByCategorySlug(categorySlug);
  if (letterCollection) {
    redirect(letterCollection.path);
  }

  const [settings, categories, activeCategory] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getCategoryBySlug(categorySlug),
  ]);
  const copy = settings.pageCopy.blog;

  const noteCategories = filterNonLetterCategories(categories);
  const letterCategoryIds = getLetterCategoryIds(categories);

  const postData = await getPosts({
    page: currentPage,
    search: query || undefined,
    categoryId: activeCategory?.id,
    excludeCategoryIds: letterCategoryIds,
  });

  const categoryMap = new Map(noteCategories.map((category) => [category.id, category.name]));

  return (
    <>
      <section className="section-space">
        <div className="container space-y-6">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
          <SearchInput defaultValue={query} />
          <CategoryPills
            categories={noteCategories}
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
              title={copy.emptyTitle || "No notes match this search yet"}
              description={copy.emptyDescription || "Try a broader keyword or adjust the filters."}
            />
          )}
        </div>
      </section>

      <NewsletterSection settings={settings} />
    </>
  );
}
