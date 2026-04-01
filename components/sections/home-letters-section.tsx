import Link from "next/link";

import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card } from "@/components/ui/card";
import type { LetterCollection } from "@/lib/letters";
import type { PostSummary } from "@/types/content";

type LetterGateway = {
  collection: LetterCollection;
  latestPost?: PostSummary | null;
};

export function HomeLettersSection({
  collections,
}: {
  collections: LetterGateway[];
}) {
  return (
    <section className="section-space pt-0">
      <div className="container space-y-6">
        <SectionHeading
          eyebrow="Letters to Myself"
          title="Enter the letters, one season at a time."
          description="Letters live in their own quiet rooms here. Choose the chapter that meets you where you are, then follow the thread."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {collections.map(({ collection, latestPost }, index) => (
            <FadeIn key={collection.slug} delay={0.04 * index}>
              <Card className="flex h-full flex-col justify-between gap-5 p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="eyebrow">{collection.shortLabel}</p>
                    <h3 className="text-[2.2rem] leading-[0.98] tracking-[-0.035em]">
                      {collection.title}
                    </h3>
                  </div>
                  <p className="text-[1rem] leading-8 text-foreground/85">
                    {collection.description}
                  </p>
                  {latestPost ? (
                    <div className="rounded-2xl border border-border/80 bg-accent/25 p-4">
                      <p className="eyebrow">Start here</p>
                      <p className="mt-2 font-serif text-[1.4rem] leading-[1.08] tracking-[-0.02em] text-foreground">
                        {latestPost.title}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-4 text-[12px] font-semibold uppercase tracking-[0.16em]">
                  <Link href={collection.path} className="soft-link">
                    Open the letters
                  </Link>
                  {latestPost ? (
                    <Link href={`/blog/${latestPost.slug}`} className="soft-link">
                      Read one now
                    </Link>
                  ) : null}
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
