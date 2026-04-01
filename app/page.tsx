import { FeaturedPostCard } from "@/components/content/featured-post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { Hero } from "@/components/sections/hero";
import { HomeJournalSection } from "@/components/sections/home-journal-section";
import { HomeLettersSection } from "@/components/sections/home-letters-section";
import { HomePopularStrip } from "@/components/sections/home-popular-strip";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { SocialLinksSection } from "@/components/sections/social-links-section";
import { TestimonialsPreview } from "@/components/sections/testimonials-preview";
import {
  getCategories,
  getLatestPosts,
  getPosts,
  getPageBySlug,
  getSiteSettings,
  getStickyFeaturedPost,
  getTestimonials,
} from "@/lib/api/wordpress";
import { getLetterCategoryIds, LETTER_COLLECTIONS } from "@/lib/letters";
import type { ContentId } from "@/types/content";

function getCategoryLabels(ids: ContentId[], categoryMap: Map<ContentId, string>) {
  return ids.map((id) => categoryMap.get(id)).filter(Boolean) as string[];
}

export default async function HomePage() {
  const [settings, aboutPage, featuredPost, testimonials, categories] =
    await Promise.all([
      getSiteSettings(),
      getPageBySlug("about"),
      getStickyFeaturedPost(),
      getTestimonials(3),
      getCategories(),
    ]);

  const letterCategoryIds = getLetterCategoryIds(categories);
  const featuredNote =
    featuredPost && !featuredPost.categories.some((id) => letterCategoryIds.includes(id))
      ? featuredPost
      : await getStickyFeaturedPost({
          excludeCategoryIds: letterCategoryIds,
        });

  const [latestPosts, letterCollections] = await Promise.all([
    getLatestPosts(6, featuredNote?.id, {
      excludeCategoryIds: letterCategoryIds,
    }),
    Promise.all(
      LETTER_COLLECTIONS.map(async (collection) => {
        const category = categories.find((entry) =>
          collection.categorySlugs.includes(entry.slug),
        );

        const latestLetter = category
          ? (
              await getPosts({
                page: 1,
                perPage: 1,
                categoryId: category.id,
              })
            ).items[0] ?? null
          : null;

        return {
          collection,
          latestPost: latestLetter,
        };
      }),
    ),
  ]);

  const popularPosts = [featuredNote, ...latestPosts]
    .filter((post): post is NonNullable<typeof post> => Boolean(post))
    .slice(0, 4);
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <>
      <Hero settings={settings} aboutPreview={aboutPage} />

      <section className="section-space pt-0">
        <div className="container space-y-6">
          <SectionHeading
            eyebrow="Featured article"
            title="One story to start with."
            description="Home now highlights notes separately, while letters live in their own destination."
          />
          {featuredNote ? (
            <FeaturedPostCard
              post={featuredNote}
              categoryLabels={getCategoryLabels(featuredNote.categories, categoryMap)}
            />
          ) : (
            <EmptyState
              title="No featured note yet"
              description="Publish a non-letter post and mark it as featured in Sanity Studio to place it here."
            />
          )}
        </div>
      </section>

      <HomePopularStrip posts={popularPosts} />

      <HomeLettersSection collections={letterCollections} />

      {latestPosts.length ? (
        <HomeJournalSection
          posts={latestPosts}
          settings={settings}
          aboutPage={aboutPage}
          categoryMap={categoryMap}
        />
      ) : (
        <section className="section-space pt-0">
          <div className="container">
            <EmptyState
              title="The journal is waiting for its first post"
              description="Create and publish blog posts in Sanity Studio to populate the homepage feed."
            />
          </div>
        </section>
      )}

      {testimonials.length ? <TestimonialsPreview testimonials={testimonials} /> : null}

      <NewsletterSection settings={settings} />
      <SocialLinksSection settings={settings} />
    </>
  );
}
