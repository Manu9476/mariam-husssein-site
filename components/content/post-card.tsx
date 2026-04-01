import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { PostLikeButton } from "@/components/content/post-like-button";
import { formatDate, stripHtml } from "@/lib/utils";
import type { PostSummary } from "@/types/content";

export function PostCard({
  post,
  categoryLabels = [],
}: {
  post: PostSummary;
  categoryLabels?: string[];
}) {
  const hasImage = Boolean(post.image?.url);

  return (
    <FadeIn>
      <Card className="group overflow-hidden p-5">
        <div className="space-y-5">
          {hasImage ? (
            <Link
              href={`/blog/${post.slug}`}
              className="relative block overflow-hidden rounded-md border border-border/80"
            >
              <ImageWrapper
                image={post.image}
                alt={post.title}
                className="aspect-[4/3] transition duration-700 group-hover:scale-[1.03]"
              />
            </Link>
          ) : null}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {categoryLabels[0] ? <Badge>{categoryLabels[0]}</Badge> : null}
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {formatDate(post.date)}
              </span>
              {typeof post.commentCount === "number" && post.commentCount > 0 ? (
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                </span>
              ) : null}
            </div>
            <div className="space-y-3">
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-[2.1rem] leading-[1.04] tracking-[-0.03em] transition group-hover:text-primary md:text-[2.45rem]">
                  {post.title}
                </h3>
              </Link>
              <p className="line-clamp-3 text-[1.02rem] leading-8">{stripHtml(post.excerpt)}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href={`/blog/${post.slug}`} className="soft-link">
                Read article <ArrowRight className="h-4 w-4" />
              </Link>
              <PostLikeButton postId={post.id} initialCount={post.likeCount} compact />
            </div>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}
