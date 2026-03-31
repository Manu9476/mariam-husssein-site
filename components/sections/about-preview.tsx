import Link from "next/link";

import { FadeIn } from "@/components/shared/fade-in";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { PageContent } from "@/types/content";

export function AboutPreview({
  page,
}: {
  page?: PageContent | null;
}) {
  return (
    <section className="section-space">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <FadeIn>
            <div className="overflow-hidden rounded-md border border-border/80 bg-white shadow-sm">
              <ImageWrapper
                image={page?.image}
                alt={page?.title || "About Mariam"}
                className="aspect-[4/5]"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="space-y-6">
            <SectionHeading
              eyebrow="About Mariam"
              title={page?.title || "A grounded voice with an editorial eye."}
              description={
                page?.excerpt.replace(/<[^>]*>/g, "") ||
                "Use the About page in Sanity Studio to shape this section with your voice, story, and current direction."
              }
            />
            <Button asChild variant="outline">
              <Link href="/about">Read the full story</Link>
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
