import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentsDrawer } from "@/components/content/comments-drawer";
import { PostLikeButton } from "@/components/content/post-like-button";
import { PostCard } from "@/components/content/post-card";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getCategories,
  getCommentsForPost,
  getPostBySlug,
  getRelatedPosts,
  getSiteSettings,
} from "@/lib/api/wordpress";
import { getLetterCollectionByCategorySlug } from "@/lib/letters";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import { deriveDisplayNameFromEmail, formatDate } from "@/lib/utils";
import type { ContentId } from "@/types/content";

function getCategoryLabels(ids: ContentId[], categoryMap: Map<ContentId, string>) {
  return ids.map((id) => categoryMap.get(id)).filter(Boolean) as string[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [settings, post] = await Promise.all([getSiteSettings(), getPostBySlug(slug)]);

  if (!post) {
    return buildMetadata(settings, {
      title: "Post not found",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const seo = resolveSeoCopy({
    title: post.title,
    excerpt: post.excerpt,
    seo: post.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image || post.image?.url,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const [post, categories] = await Promise.all([getPostBySlug(slug), getCategories()]);

  if (!post) {
    notFound();
  }

  const [relatedPosts, comments] = await Promise.all([
    getRelatedPosts(post, 3),
    getCommentsForPost(post.id),
  ]);
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const letterCollection =
    categories
      .map((category) =>
        post.categories.includes(category.id)
          ? getLetterCollectionByCategorySlug(category.slug)
          : null,
      )
      .find(Boolean) ?? null;
  const categoryLabels = getCategoryLabels(post.categories, categoryMap);
  const backHref = letterCollection?.path || "/blog";
  const backLabel = letterCollection
    ? `Back to ${letterCollection.shortLabel}`
    : "Back to the notes";
  const subscriberEmail =
    cookieStore.get("mh_newsletter_subscriber")?.value?.trim().toLowerCase() || "";
  const rememberedCommentEmail =
    cookieStore.get("mh_commenter_email")?.value?.trim().toLowerCase() || "";
  const rememberedCommentName = cookieStore.get("mh_commenter_name")?.value?.trim() || "";
  const rememberedEmail = subscriberEmail || rememberedCommentEmail;
  const rememberedIdentity = rememberedEmail
    ? {
        name:
          rememberedCommentName || deriveDisplayNameFromEmail(rememberedEmail),
        email: rememberedEmail,
        source: subscriberEmail ? ("subscriber" as const) : ("commenter" as const),
      }
    : null;

  return (
    <>
      <article className="section-space">
        <div className="container space-y-6">
          <div className="mx-auto max-w-[44rem] space-y-4">
            <Link href={backHref} className="eyebrow inline-flex">
              {backLabel}
            </Link>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {categoryLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
                <span>{formatDate(post.date)}</span>
                <span>{post.readingTime} min read</span>
                {typeof post.commentCount === "number" && post.commentCount > 0 ? (
                  <span>
                    {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                  </span>
                ) : null}
              </div>
              <h1 className="text-[3.35rem] leading-[0.94] tracking-[-0.045em] md:text-[4.75rem]">
                {post.title}
              </h1>
              {post.authorName ? (
                <p className="text-base text-muted-foreground">
                  By {post.authorName}
                </p>
              ) : null}
            </div>
          </div>

          {post.image?.url ? (
            <div className="mx-auto max-w-lg overflow-hidden rounded-md border border-border/80 bg-white shadow-sm">
              <ImageWrapper
                image={post.image}
                alt={post.title}
                className="aspect-[4/3]"
                priority
                sizes="(min-width: 1024px) 32rem, 90vw"
              />
            </div>
          ) : null}

          <div className="mx-auto max-w-[42rem]">
            <RichTextRenderer content={post.content} />
            <div className="mt-10 border-t border-border/70 pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <CommentsDrawer
                  comments={comments}
                  postId={post.id}
                  rememberedIdentity={rememberedIdentity}
                />
                <PostLikeButton
                  postId={post.id}
                  initialCount={post.likeCount}
                  prominent
                />
              </div>
            </div>
          </div>
        </div>
      </article>

      {relatedPosts.length ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow="Continue reading"
              title="More from the journal."
              description="Related posts selected from the same themes and subjects."
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <PostCard
                  key={relatedPost.id}
                  post={relatedPost}
                  categoryLabels={getCategoryLabels(relatedPost.categories, categoryMap)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
