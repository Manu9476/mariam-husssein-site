import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { Button } from "@/components/ui/button";
import { stripHtml } from "@/lib/utils";
import type { PageContent } from "@/types/content";
import type { SiteSettings } from "@/types/wordpress";

export function Hero({
  settings,
  aboutPreview,
}: {
  settings: SiteSettings;
  aboutPreview?: PageContent | null;
}) {
  const portrait = aboutPreview?.image;
  const introCopy =
    settings.profile.summary ||
    stripHtml(aboutPreview?.excerpt) ||
    settings.hero.subtitle;
  const highlights = settings.profile.highlights.slice(0, 3);
  const quickLinks = settings.profile.quickLinks;

  return (
    <section className="section-space pb-10 pt-8 md:pb-14 md:pt-10">
      <div className="container">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <FadeIn className="space-y-8">
            <div className="space-y-5">
              {settings.hero.eyebrow ? <p className="eyebrow">{settings.hero.eyebrow}</p> : null}
              <div className="space-y-4">
                <h1 className="max-w-5xl text-[3.25rem] leading-[0.9] tracking-[-0.055em] md:text-[5rem] xl:text-[5.7rem]">
                  {settings.siteTitle}
                </h1>
                <p className="max-w-3xl font-serif text-[1.35rem] leading-[1.08] tracking-[-0.03em] text-primary md:text-[2rem] xl:text-[2.45rem]">
                  {settings.hero.title}
                </p>
                <p className="max-w-2xl text-[1.02rem] leading-8 text-foreground/82 md:text-[1.12rem]">
                  {settings.hero.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={settings.hero.primaryCtaUrl}>{settings.hero.primaryCtaLabel}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={settings.hero.secondaryCtaUrl}>{settings.hero.secondaryCtaLabel}</Link>
              </Button>
            </div>

            {quickLinks.length ? (
              <div className="flex flex-wrap gap-2.5">
                {quickLinks.map((item) => {
                  const external = item.url.startsWith("http");

                  return (
                    <Link
                      key={`${item.title}-${item.url}`}
                      href={item.url}
                      target={item.target || (external ? "_blank" : undefined)}
                      rel={external ? "noreferrer" : undefined}
                      className="rounded-full border border-border/80 bg-white/80 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-foreground transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </FadeIn>

          <FadeIn delay={0.08} className="grid gap-5">
            {portrait?.url ? (
              <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-white/70 shadow-soft">
                <ImageWrapper
                  image={portrait}
                  alt={aboutPreview?.title || settings.siteTitle}
                  className="aspect-[4/5]"
                  priority
                  sizes="(min-width: 1280px) 32rem, (min-width: 768px) 44vw, 100vw"
                />
              </div>
            ) : null}

            <div className="editorial-panel space-y-5 p-6 md:p-7">
              {settings.profile.eyebrow ? <p className="eyebrow">{settings.profile.eyebrow}</p> : null}
              <div className="space-y-3">
                {settings.profile.title ? (
                  <h2 className="text-[2.25rem] leading-[0.96] tracking-[-0.04em] md:text-[3rem]">
                    {settings.profile.title}
                  </h2>
                ) : null}
                <p className="text-[1rem] leading-8 text-foreground/82">{introCopy}</p>
              </div>

              {highlights.length ? (
                <ul className="grid gap-3 border-t border-border/70 pt-5">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[0.98rem] leading-7 text-foreground/84">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {settings.profile.primaryLinkLabel && settings.profile.primaryLinkUrl ? (
                <Link href={settings.profile.primaryLinkUrl} className="soft-link">
                  {settings.profile.primaryLinkLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
