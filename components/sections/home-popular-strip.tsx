import Link from "next/link";

import { PostLikeButton } from "@/components/content/post-like-button";
import { FadeIn } from "@/components/shared/fade-in";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { formatDate } from "@/lib/utils";
import type { PostSummary } from "@/types/content";

export function HomePopularStrip({
  posts,
  title = "Most Popular",
  archiveHref = "/blog",
  archiveLabel = "View archive",
}: {
  posts: PostSummary[];
  title?: string;
  archiveHref?: string;
  archiveLabel?: string;
}) {
  if (!posts.length) {
    return null;
  }

  return (
    <section className="pb-14 md:pb-20">
      <FadeIn className="container">
        <div className="border-y border-border/70 py-9">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-[2.5rem] leading-[0.96] tracking-[-0.035em] md:text-[3.4rem]">
              {title}
            </h2>
            <Link href={archiveHref} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-primary">
              {archiveLabel}
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className={`grid gap-4 rounded-xl p-2 transition hover:bg-accent/40 ${
                  post.image?.url
                    ? "md:grid-cols-[1fr_92px] md:items-center xl:grid-cols-1"
                    : ""
                }`}
              >
                <div className="space-y-2">
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-[1.55rem] leading-[1.08] tracking-[-0.02em] transition hover:text-primary md:text-[1.75rem]">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {formatDate(post.date)}
                    {typeof post.commentCount === "number" && post.commentCount > 0
                      ? ` / ${post.commentCount} ${post.commentCount === 1 ? "comment" : "comments"}`
                      : ""}
                  </p>
                  <PostLikeButton postId={post.id} initialCount={post.likeCount} compact />
                </div>
                {post.image?.url ? (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="overflow-hidden rounded-md border border-border/80"
                  >
                    <ImageWrapper image={post.image} alt={post.title} className="aspect-square" />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
