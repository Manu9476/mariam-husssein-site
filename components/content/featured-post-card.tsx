import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, stripHtml } from "@/lib/utils";
import type { PostSummary } from "@/types/content";

export function FeaturedPostCard({
  post,
  categoryLabels = [],
  label = "Featured note",
}: {
  post: PostSummary;
  categoryLabels?: string[];
  label?: string;
}) {
  const hasImage = Boolean(post.image?.url);

  return (
    <FadeIn>
      <Card className="overflow-hidden p-5 md:p-6">
        <div
          className={`grid gap-5 lg:items-center ${
            hasImage ? "lg:grid-cols-[0.86fr_1.14fr]" : ""
          }`}
        >
          {hasImage ? (
            <Link
              href={`/blog/${post.slug}`}
              className="relative overflow-hidden rounded-md border border-border/80"
            >
              <ImageWrapper
                image={post.image}
                alt={post.title}
                className="aspect-[4/3] transition duration-700 hover:scale-[1.02]"
                priority
                sizes="(min-width: 1024px) 26rem, 100vw"
              />
            </Link>
          ) : null}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{label}</Badge>
              {categoryLabels[0] ? <Badge variant="outline">{categoryLabels[0]}</Badge> : null}
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {formatDate(post.date)} / {post.readingTime} min read
                {typeof post.commentCount === "number" && post.commentCount > 0
                  ? ` / ${post.commentCount} ${post.commentCount === 1 ? "comment" : "comments"}`
                  : ""}
              </p>
              <h3 className="max-w-3xl text-[2.45rem] leading-[0.95] tracking-[-0.04em] md:text-[3.55rem]">
                {post.title}
              </h3>
              <p className="max-w-2xl text-[1rem] leading-8 md:text-[1.06rem]">
                {stripHtml(post.excerpt)}
              </p>
            </div>
            <Link href={`/blog/${post.slug}`} className="soft-link">
              Read the full story <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}
