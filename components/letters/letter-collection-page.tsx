import Link from "next/link";

import { EditorialListItem } from "@/components/content/editorial-list-item";
import { FeaturedPostCard } from "@/components/content/featured-post-card";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { LettersNav } from "@/components/letters/letters-nav";
import { EmptyState } from "@/components/shared/empty-state";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { SocialIconLink } from "@/components/shared/social-icon-link";
import { HomePopularStrip } from "@/components/sections/home-popular-strip";
import { LETTER_COLLECTIONS, type LetterCollection } from "@/lib/letters";
import { clampText, stripHtml } from "@/lib/utils";
import type {
  CategorySummary,
  ContentId,
  PageContent,
  PostSummary,
} from "@/types/content";
import type { SiteSettings } from "@/types/wordpress";

function getCategoryLabel(
  post: PostSummary,
  categoryMap: Map<ContentId, string>,
  collectionCategoryId?: ContentId,
) {
  const alternateCategoryId = post.categories.find((id) => id !== collectionCategoryId);
  return categoryMap.get(alternateCategoryId ?? post.categories[0] ?? -1);
}

export function LetterCollectionPage({
  collection,
  settings,
  introPage,
  aboutPage,
  category,
  posts,
  categoryMap,
}: {
  collection: LetterCollection;
  settings: SiteSettings;
  introPage: PageContent | null;
  aboutPage: PageContent | null;
  category: CategorySummary | null;
  posts: PostSummary[];
  categoryMap: Map<ContentId, string>;
}) {
  const featuredPost = posts[0];
  const feedPosts = featuredPost ? posts.slice(1) : posts;
  const popularPosts = posts.slice(0, 4);
  const archiveHref = collection.path;
  const introTitle = introPage?.title || collection.title;
  const introCopy = clampText(
    stripHtml(introPage?.excerpt || introPage?.content) || collection.description,
    260,
  );
  const featuredCategoryLabel = featuredPost
    ? getCategoryLabel(featuredPost, categoryMap, category?.id)
    : undefined;
  const profileImage =
    aboutPage?.image ??
    introPage?.image ??
    (settings.logoUrl
      ? { url: settings.logoUrl, alt: settings.logoAlt || settings.siteTitle }
      : null);
  const relatedCollections = LETTER_COLLECTIONS.filter(
    (entry) => entry.slug !== collection.slug,
  );

  return (
    <>
      <section className="section-space pb-6">
        <div className="container space-y-6">
          <div className="space-y-4 border-b border-border/70 pb-5 text-center">
            <div className="space-y-2">
              <p className="eyebrow">Letters to myself</p>
              <h1 className="mx-auto max-w-4xl text-[2.7rem] leading-[0.95] tracking-[-0.04em] md:text-[3.8rem] lg:text-[4.4rem]">
                {introTitle}
              </h1>
              <p className="mx-auto max-w-[42rem] text-[1rem] leading-8 text-foreground/80 md:text-[1.06rem]">
                {introCopy}
              </p>
            </div>

            <LettersNav activeSlug={collection.slug} />
          </div>

          {featuredPost ? (
            <FeaturedPostCard
              post={featuredPost}
              label="Featured letter"
              categoryLabels={featuredCategoryLabel ? [featuredCategoryLabel] : []}
            />
          ) : (
            <EmptyState
              title={`No letters in ${collection.shortLabel} yet`}
              description={`Create a Sanity category using the slug "${collection.categorySlugs[0]}", assign posts to it, and this page will populate automatically.`}
            />
          )}
        </div>
      </section>

      <HomePopularStrip
        posts={popularPosts}
        title="A Few to Begin With"
        archiveHref={archiveHref}
        archiveLabel="Return to collection"
      />

      <section className="section-space pt-0">
        <div className="container grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <div className="mb-4 flex items-end justify-between gap-4 border-b border-border/70 pb-4">
              <div>
                <p className="eyebrow">Recent letters</p>
                <h2 className="mt-2 max-w-3xl text-[2.15rem] leading-[0.98] tracking-[-0.035em] md:text-[3.05rem]">
                  Notes, reflections, and quieter truths.
                </h2>
              </div>
              <Link
                href={archiveHref}
                className="hidden text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground transition hover:text-primary md:inline-flex"
              >
                This collection
              </Link>
            </div>

            {feedPosts.length ? (
              <div>
                {feedPosts.map((post) => (
                  <EditorialListItem
                    key={post.id}
                    post={post}
                    categoryLabel={getCategoryLabel(post, categoryMap, category?.id)}
                  />
                ))}
              </div>
            ) : featuredPost ? (
              <EmptyState
                title="More letters are coming"
                description="Publish more posts in this collection to expand the archive below the featured story."
              />
            ) : null}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28">
            <div className="editorial-panel space-y-4 p-5">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border/70">
                  {profileImage ? (
                    <ImageWrapper
                      image={profileImage}
                      alt={settings.siteTitle}
                      fill
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary font-serif text-xl text-foreground">
                      M
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-serif text-[2rem] leading-none tracking-[-0.035em]">
                    {collection.shortLabel}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {settings.siteTitle}
                  </p>
                </div>
              </div>

              <p className="text-[0.98rem] leading-8">{introCopy}</p>

              <Link href="/newsletter" className="soft-link">
                Subscribe for new letters
              </Link>
            </div>

            <div className="editorial-panel space-y-4 p-5">
              <div className="space-y-2">
                <p className="eyebrow">{settings.newsletter.eyebrow || "Stay close"}</p>
                <h3 className="text-[1.95rem] leading-[1] tracking-[-0.03em]">
                  {settings.newsletter.title}
                </h3>
                <p>{settings.newsletter.description}</p>
              </div>
              <NewsletterForm
                placeholder={settings.newsletter.placeholder}
                buttonLabel={settings.newsletter.buttonLabel}
              />
            </div>

            <div className="editorial-panel space-y-5 p-5">
              <div>
                <p className="eyebrow">Read next</p>
                <div className="mt-4 flex flex-col gap-3">
                  {relatedCollections.map((entry) => (
                    <Link
                      key={entry.slug}
                      href={entry.path}
                      className="font-serif text-[1.35rem] leading-[1.12] tracking-[-0.015em] text-foreground transition hover:text-primary"
                    >
                      {entry.title}
                    </Link>
                  ))}
                </div>
              </div>

              {settings.socialLinks.length ? (
                <div>
                  <p className="eyebrow">Elsewhere</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {settings.socialLinks.map((item) => (
                      <SocialIconLink key={item.label} label={item.label} url={item.url} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
