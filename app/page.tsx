import { FeaturedPostCard } from "@/components/content/featured-post-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Hero } from "@/components/sections/hero";
import { HomeJournalSection } from "@/components/sections/home-journal-section";
import { HomeLettersSection } from "@/components/sections/home-letters-section";
import { SocialLinksSection } from "@/components/sections/social-links-section";
import { TestimonialsPreview } from "@/components/sections/testimonials-preview";
import {
  getCategories,
  getLatestPosts,
  getPageByPossibleSlugs,
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
          introPage: await getPageByPossibleSlugs(collection.pageSlugs),
        };
      }),
    ),
  ]);

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <>
      <Hero settings={settings} aboutPreview={aboutPage} />

      {featuredNote ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow={settings.home.featured.eyebrow}
              title={settings.home.featured.title}
              description={settings.home.featured.description}
            />
            <FeaturedPostCard
              post={featuredNote}
              categoryLabels={getCategoryLabels(featuredNote.categories, categoryMap)}
              label={settings.home.featured.label}
            />
          </div>
        </section>
      ) : null}

      <HomeLettersSection collections={letterCollections} settings={settings} />

      {latestPosts.length ? (
        <HomeJournalSection
          posts={latestPosts}
          settings={settings}
          aboutPage={aboutPage}
          categoryMap={categoryMap}
        />
      ) : null}

      {testimonials.length ? <TestimonialsPreview testimonials={testimonials} settings={settings} /> : null}

      <SocialLinksSection settings={settings} />
    </>
  );
}
