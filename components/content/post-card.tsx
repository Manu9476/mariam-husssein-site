import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { formatDate, stripHtml } from "@/lib/utils";
import type { PostSummary } from "@/types/content";

export function PostCard({
  post,
  categoryLabels = [],
}: {
  post: PostSummary;
  categoryLabels?: string[];
}) {
  return (
    <FadeIn>
      <Card className="group overflow-hidden p-5">
        <div className="space-y-5">
          <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden rounded-md border border-border/80">
            <ImageWrapper
              image={post.image}
              alt={post.title}
              className="aspect-[4/3] transition duration-700 group-hover:scale-[1.03]"
            />
          </Link>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {categoryLabels[0] ? <Badge>{categoryLabels[0]}</Badge> : null}
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {formatDate(post.date)}
              </span>
            </div>
            <div className="space-y-3">
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-[2.1rem] leading-[1.04] tracking-[-0.03em] transition group-hover:text-primary md:text-[2.45rem]">
                  {post.title}
                </h3>
              </Link>
              <p className="line-clamp-3 text-[1.02rem] leading-8">{stripHtml(post.excerpt)}</p>
            </div>
            <Link href={`/blog/${post.slug}`} className="soft-link">
              Read article <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}
