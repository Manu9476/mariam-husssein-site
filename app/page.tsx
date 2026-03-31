import { FeaturedPostCard } from "@/components/content/featured-post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { Hero } from "@/components/sections/hero";
import { HomeJournalSection } from "@/components/sections/home-journal-section";
import { HomePopularStrip } from "@/components/sections/home-popular-strip";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { SocialLinksSection } from "@/components/sections/social-links-section";
import { TestimonialsPreview } from "@/components/sections/testimonials-preview";
import {
  getCategories,
  getLatestPosts,
  getPageBySlug,
  getSiteSettings,
  getStickyFeaturedPost,
  getTestimonials,
} from "@/lib/api/wordpress";

function getCategoryLabels(ids: number[], categoryMap: Map<number, string>) {
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

  const latestPosts = await getLatestPosts(6, featuredPost?.id);
  const popularPosts = [featuredPost, ...latestPosts]
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
            description="Use sticky posts in WordPress to control this featured editorial highlight."
          />
          {featuredPost ? (
            <FeaturedPostCard
              post={featuredPost}
              categoryLabels={getCategoryLabels(featuredPost.categories, categoryMap)}
            />
          ) : (
            <EmptyState
              title="No featured story yet"
              description="Publish a post and mark it as sticky in WordPress to feature it here."
            />
          )}
        </div>
      </section>

      <HomePopularStrip posts={popularPosts} />

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
              description="Create and publish blog posts in WordPress to populate the homepage feed."
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
