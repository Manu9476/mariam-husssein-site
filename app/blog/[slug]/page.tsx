import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/forms/comment-form";
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
import { formatDate } from "@/lib/utils";
import type { CommentEntry, ContentId } from "@/types/content";

function getCategoryLabels(ids: ContentId[], categoryMap: Map<ContentId, string>) {
  return ids.map((id) => categoryMap.get(id)).filter(Boolean) as string[];
}

function countComments(entries: CommentEntry[]): number {
  return entries.reduce(
    (total, entry) => total + 1 + countComments(entry.replies ?? []),
    0,
  );
}

function CommentThread({
  comments,
  postId,
  depth = 0,
}: {
  comments: CommentEntry[];
  postId: ContentId;
  depth?: number;
}) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <article key={comment.id} className="editorial-panel space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span>{comment.name}</span>
            {comment.date ? <span>{formatDate(comment.date)}</span> : null}
            {depth ? <span>Reply</span> : null}
          </div>
          <p className="text-[1rem] leading-8 text-foreground/90">{comment.message}</p>
          <details className="pt-1">
            <summary className="soft-link cursor-pointer list-none">
              Reply thoughtfully
            </summary>
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                replyToName={comment.name}
                compact
              />
            </div>
          </details>
          {comment.replies?.length ? (
            <div className="space-y-4 border-l border-border/70 pl-4 sm:pl-6">
              <CommentThread comments={comment.replies} postId={postId} depth={depth + 1} />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function CommentsSection({
  comments,
  postId,
}: {
  comments: CommentEntry[];
  postId: ContentId;
}) {
  const totalComments = countComments(comments);

  return (
    <section className="section-space pt-0">
      <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Conversation"
            title="Leave a thoughtful comment."
            description="Comments are saved in Sanity Studio and only appear publicly after approval."
            animate={false}
          />
          <CommentForm postId={postId} />
        </div>

        <div className="space-y-4">
          <SectionHeading
            eyebrow="Approved comments"
            title={totalComments ? `What readers are saying (${totalComments}).` : "No comments yet."}
            description={
              totalComments
                ? "Approved comments and replies from the conversation around this post."
                : "Be the first to share a kind, thoughtful response."
            }
            animate={false}
          />
          {comments.length ? (
            <CommentThread comments={comments} postId={postId} />
          ) : null}
        </div>
      </div>
    </section>
  );
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
          </div>
        </div>
      </article>

      <CommentsSection comments={comments} postId={post.id} />

      {relatedPosts.length ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow="Continue reading"
              title="More from the journal."
              description="Related posts are pulled dynamically from shared Sanity categories."
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
