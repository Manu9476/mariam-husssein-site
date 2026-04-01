import Link from "next/link";

import { FadeIn } from "@/components/shared/fade-in";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { PostLikeButton } from "@/components/content/post-like-button";
import { formatDate, stripHtml } from "@/lib/utils";
import type { PostSummary } from "@/types/content";

export function EditorialListItem({
  post,
  categoryLabel,
}: {
  post: PostSummary;
  categoryLabel?: string;
}) {
  const hasImage = Boolean(post.image?.url);

  return (
    <FadeIn>
      <article
        className={`grid gap-5 border-b border-border/70 py-7 md:items-center md:py-8 ${
          hasImage ? "md:grid-cols-[1fr_230px]" : ""
        }`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {categoryLabel ? <span>{categoryLabel}</span> : null}
            <span>{formatDate(post.date)}</span>
            {post.authorName ? <span>{post.authorName}</span> : null}
            {typeof post.commentCount === "number" && post.commentCount > 0 ? (
              <span>
                {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
              </span>
            ) : null}
          </div>
          <div className="space-y-3">
            <Link href={`/blog/${post.slug}`}>
              <h3 className="text-[2rem] leading-[1.02] tracking-[-0.035em] transition hover:text-primary md:text-[2.8rem]">
                {post.title}
              </h3>
            </Link>
            <p className="max-w-2xl text-[1.02rem] leading-8 md:text-[1.1rem]">
              {stripHtml(post.excerpt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href={`/blog/${post.slug}`} className="soft-link">
              Continue reading
            </Link>
            <PostLikeButton postId={post.id} initialCount={post.likeCount} compact />
          </div>
        </div>
        {hasImage ? (
          <Link href={`/blog/${post.slug}`} className="overflow-hidden rounded-md border border-border/80">
            <ImageWrapper
              image={post.image}
              alt={post.title}
              className="aspect-[4/3] transition duration-700 hover:scale-[1.03]"
            />
          </Link>
        ) : null}
      </article>
    </FadeIn>
  );
}
