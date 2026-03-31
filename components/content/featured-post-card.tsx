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
  return (
    <FadeIn>
      <Card className="overflow-hidden p-5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <Link
            href={`/blog/${post.slug}`}
            className="relative overflow-hidden rounded-md border border-border/80"
          >
            <ImageWrapper
              image={post.image}
              alt={post.title}
              className="aspect-[5/4] transition duration-700 hover:scale-[1.02]"
              priority
            />
          </Link>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{label}</Badge>
              {categoryLabels[0] ? <Badge variant="outline">{categoryLabels[0]}</Badge> : null}
            </div>
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {formatDate(post.date)} / {post.readingTime} min read
              </p>
              <h3 className="text-[2.95rem] leading-[0.94] tracking-[-0.045em] md:text-[4.35rem]">
                {post.title}
              </h3>
              <p className="text-[1.06rem] leading-8 md:text-[1.12rem]">
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
