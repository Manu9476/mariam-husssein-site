import Link from "next/link";

import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card } from "@/components/ui/card";
import { stripHtml } from "@/lib/utils";
import type { LetterCollection } from "@/lib/letters";
import type { PageContent, PostSummary } from "@/types/content";
import type { SiteSettings } from "@/types/wordpress";

type LetterGateway = {
  collection: LetterCollection;
  latestPost?: PostSummary | null;
  introPage?: PageContent | null;
};

export function HomeLettersSection({
  collections,
  settings,
}: {
  collections: LetterGateway[];
  settings: SiteSettings;
}) {
  const copy = settings.home.letters;

  return (
    <section className="section-space pt-0">
      <div className="container space-y-6">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {collections.map(({ collection, latestPost, introPage }, index) => (
            <FadeIn key={collection.slug} delay={0.04 * index}>
              <Card className="flex h-full flex-col justify-between gap-6 border-border/80 bg-white/85 p-6 shadow-soft">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="eyebrow">{collection.shortLabel}</p>
                    <h3 className="text-[2.2rem] leading-[0.98] tracking-[-0.035em]">
                      {introPage?.title || collection.title}
                    </h3>
                  </div>
                  <p className="text-[1rem] leading-8 text-foreground/85">
                    {stripHtml(introPage?.excerpt || introPage?.content) || collection.description}
                  </p>
                  {latestPost ? (
                    <div className="rounded-[1.5rem] border border-border/80 bg-accent/35 p-4">
                      <p className="eyebrow">{copy.latestLabel}</p>
                      <p className="mt-2 font-serif text-[1.4rem] leading-[1.08] tracking-[-0.02em] text-foreground">
                        {latestPost.title}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-4 text-[12px] font-semibold uppercase tracking-[0.16em]">
                  <Link href={collection.path} className="soft-link">
                    {copy.primaryCtaLabel}
                  </Link>
                  {latestPost ? (
                    <Link href={`/blog/${latestPost.slug}`} className="soft-link">
                      {copy.secondaryCtaLabel}
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
