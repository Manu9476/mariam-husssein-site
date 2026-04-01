import type { Metadata } from "next";
import { cookies } from "next/headers";

import { NewsletterForm } from "@/components/forms/newsletter-form";
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
  const cookieStore = await cookies();
  const subscriberEmail = cookieStore.get("mh_newsletter_subscriber")?.value || "";
  const isSubscribed = Boolean(subscriberEmail);

  const [settings, page, categories] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("newsletter"),
    getCategories(),
  ]);
  const copy = settings.pageCopy.newsletterPage;

  const letterCategoryIds = getLetterCategoryIds(categories);
  const latestPosts = await getLatestPosts(isSubscribed ? 6 : 3, undefined, {
    excludeCategoryIds: letterCategoryIds,
  });
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <>
      <section className="section-space">
        <div className="container grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-5">
            <SectionHeading
              eyebrow={
                isSubscribed
                  ? copy.subscribedEyebrow
                  : copy.eyebrow || settings.newsletter.eyebrow
              }
              title={
                isSubscribed
                  ? copy.subscribedTitle || page?.title || settings.newsletter.title
                  : page?.title || copy.title || settings.newsletter.title
              }
              description={
                isSubscribed
                  ? `Welcome back${subscriberEmail ? `, ${subscriberEmail}` : ""}. ${copy.subscribedDescription || "Your published notes are ready below."}`
                  : page?.excerpt?.replace(/<[^>]*>/g, "") ||
                    copy.description ||
                    settings.newsletter.description
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
              eyebrow={isSubscribed ? copy.subscribedEyebrow : copy.previewEyebrow}
              title={
                isSubscribed
                  ? copy.subscribedTitle || "Published notes for subscribers."
                  : copy.previewTitle || "A small sample from the notes."
              }
              description={
                isSubscribed
                  ? copy.subscribedDescription ||
                    "Your browser remembers that you subscribed, so this page now opens as your reading room."
                  : copy.previewDescription ||
                    "Use this page to preview the kind of thoughtful notes subscribers can expect."
              }
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
