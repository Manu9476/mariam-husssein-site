import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { stripHtml } from "@/lib/utils";
import type { ResourceEntry } from "@/types/content";

export function ResourceCard({
  resource,
}: {
  resource: ResourceEntry;
}) {
  return (
    <FadeIn>
      <Card className="group overflow-hidden p-5">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-md border border-border/80">
            <ImageWrapper
              image={resource.image}
              alt={resource.title}
              className="aspect-[4/3] transition duration-700 group-hover:scale-[1.03]"
            />
          </div>
          <div className="space-y-3">
            {resource.highlight ? <Badge>Editor&apos;s pick</Badge> : null}
            <h3 className="text-[2.15rem] leading-tight">{resource.title}</h3>
            <p className="line-clamp-4">{stripHtml(resource.excerpt || resource.content)}</p>
          </div>
          {resource.ctaUrl ? (
            <Link
              href={resource.ctaUrl}
              target={resource.ctaUrl.startsWith("http") ? "_blank" : undefined}
              rel={resource.ctaUrl.startsWith("http") ? "noreferrer" : undefined}
              className="soft-link"
            >
              {resource.ctaLabel || "Learn more"} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </Card>
    </FadeIn>
  );
}
