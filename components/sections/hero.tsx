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
      text: "Writer, creator, and thoughtful storyteller building a softer digital home.",
    },
    {
      emoji: "📍",
      text: settings.contact.location
        ? `Currently based in ${settings.contact.location}.`
        : "Creating from wherever life feels light and inspired.",
    },
    {
      emoji: "💌",
      text: "Sharing letters, stories, and gentle resources that feel personal and encouraging.",
    },
  ];

  return (
    <section className="pb-12 pt-8 md:pb-16 md:pt-10">
      <div className="container">
        <div className="grid gap-8 border-b border-border/80 pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-12 lg:pb-14">
          <FadeIn className="lg:max-w-md">
            {aboutPreview?.image ? (
              <div className="overflow-hidden rounded-md border border-border/90 bg-white shadow-sm">
                <ImageWrapper
                  image={aboutPreview.image}
                  alt={aboutPreview.title}
                  className="aspect-[5/6]"
                  priority
                  sizes="(min-width: 1024px) 24rem, 100vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[5/6] flex-col justify-end rounded-md border border-dashed border-border bg-muted p-6 md:p-8">
                <p className="eyebrow">Portrait</p>
                <h2 className="mt-3 text-[2.2rem] leading-[0.98] tracking-[-0.03em]">
                  Add Mariam&apos;s portrait here
                </h2>
                <p className="mt-3 text-sm leading-7">
                  Upload a featured image on the About page and this space will become the opening visual.
                </p>
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.08} className="space-y-6 lg:pt-2">
            <div className="space-y-3">
              {settings.hero.eyebrow ? <p className="eyebrow">{settings.hero.eyebrow}</p> : null}
              <div className="space-y-2">
                <h1 className="max-w-4xl text-[3rem] font-bold leading-[0.92] tracking-[-0.05em] md:text-[4.35rem] lg:text-[4.95rem]">
                  Hello, I&apos;m Mariam. 👋
                </h1>
                <p className="max-w-3xl font-serif text-[1.55rem] leading-[1.06] tracking-[-0.03em] text-primary md:text-[2.25rem] lg:text-[2.7rem]">
                  {settings.hero.title}
                </p>
              </div>
              <p className="max-w-2xl text-[1rem] leading-8 md:text-[1.08rem]">
                {introCopy}
              </p>
            </div>

            <ul className="grid max-w-2xl gap-3 rounded-2xl border border-border/80 bg-[#f8fcfa] p-4 md:p-5">
              {heroFacts.map((fact) => (
                <li key={fact.text} className="flex items-start gap-3 text-[1rem] leading-7 text-foreground">
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

            <div className="flex flex-wrap gap-2">
              {quickLinks.map((item) => {
                const external = item.url.startsWith("http");

                return (
                  <Link
                    key={`${item.label}-${item.url}`}
                    href={item.url}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="nav-link rounded-full border border-border bg-white px-3.5 py-2"
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
