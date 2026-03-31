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
  const introCopy = stripHtml(aboutPreview?.excerpt) || settings.hero.subtitle;
  const quickLinks = [
    { label: "Letters", url: "/letters/younger-me" },
    { label: "Notes", url: "/blog" },
    { label: "Newsletter", url: "/newsletter" },
  ];
  const heroFacts = [
    {
      emoji: "👩‍💻",
      text: "Writer, creator, and thoughtful storyteller with a soft spot for meaningful digital spaces.",
    },
    {
      emoji: "📍",
      text: settings.contact.location
        ? `Currently based in ${settings.contact.location}.`
        : "Creating from wherever life feels light and inspired.",
    },
    {
      emoji: "💌",
      text: "Sharing stories, letters, and gentle resources that feel personal, bright, and encouraging.",
    },
  ];

  return (
    <section className="pb-14 pt-10 md:pb-20 md:pt-12">
      <div className="container">
        <div className="grid gap-10 border-b border-border/80 pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14 lg:pb-16">
          <FadeIn>
            {aboutPreview?.image ? (
              <div className="overflow-hidden rounded-md border border-border/90 bg-white shadow-sm">
                <ImageWrapper
                  image={aboutPreview.image}
                  alt={aboutPreview.title}
                  className="aspect-[4/5]"
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/5] flex-col justify-end rounded-md border border-dashed border-border bg-muted p-8 md:p-10">
                <p className="eyebrow">Portrait</p>
                <h2 className="mt-4 text-4xl leading-none">
                  Add Mariam&apos;s portrait here ✨
                </h2>
                <p className="mt-4 text-base">
                  Upload a featured image on the About page and this space will become the opening visual.
                </p>
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.08} className="space-y-7 lg:pt-3">
            <div className="space-y-4">
              {settings.hero.eyebrow ? <p className="eyebrow">{settings.hero.eyebrow}</p> : null}
              <div className="space-y-3">
                <h1 className="max-w-4xl text-[3.25rem] font-bold leading-[0.92] tracking-[-0.05em] md:text-[4.9rem] lg:text-[5.6rem]">
                  Hello, I&apos;m Mariam. 👋
                </h1>
                <p className="max-w-3xl font-serif text-[1.8rem] leading-[1.05] tracking-[-0.03em] text-primary md:text-[2.8rem] lg:text-[3.35rem]">
                  {settings.hero.title}
                </p>
              </div>
              <p className="max-w-2xl text-[1.05rem] leading-8 md:text-[1.12rem]">
                {introCopy}
              </p>
            </div>

            <ul className="grid gap-3 rounded-2xl border border-border/80 bg-[#f8fcfa] p-5">
              {heroFacts.map((fact) => (
                <li key={fact.text} className="flex items-start gap-3 text-[1.02rem] leading-7 text-foreground">
                  <span className="text-xl leading-none">{fact.emoji}</span>
                  <span>{fact.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Button asChild size="lg">
                <Link href={settings.hero.primaryCtaUrl}>
                  {settings.hero.primaryCtaLabel}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={settings.hero.secondaryCtaUrl}>
                  {settings.hero.secondaryCtaLabel}
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {quickLinks.map((item) => {
                const external = item.url.startsWith("http");

                return (
                  <Link
                    key={`${item.label}-${item.url}`}
                    href={item.url}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="nav-link rounded-full border border-border bg-white px-4 py-2"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Link href="/about" className="soft-link pt-1">
              Read Mariam&apos;s story <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
