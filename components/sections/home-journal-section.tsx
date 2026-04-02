import Link from "next/link";

import { EditorialListItem } from "@/components/content/editorial-list-item";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { SocialIconLink } from "@/components/shared/social-icon-link";
import { stripHtml } from "@/lib/utils";
import type { ContentId, PageContent, PostSummary } from "@/types/content";
import type { SiteSettings } from "@/types/wordpress";

export function HomeJournalSection({
  posts,
  settings,
  aboutPage,
  categoryMap,
}: {
  posts: PostSummary[];
  settings: SiteSettings;
  aboutPage?: PageContent | null;
  categoryMap: Map<ContentId, string>;
}) {
  if (!posts.length) {
    return null;
  }

  const copy = settings.home.notes;
  const browseLinks = settings.primaryMenu.filter((item) => item.url !== "/");
  const profileSummary =
    settings.profile.summary ||
    stripHtml(aboutPage?.excerpt) ||
    settings.siteDescription ||
    settings.hero.subtitle;
  const profileImage =
    aboutPage?.image ??
    (settings.logoUrl
      ? { url: settings.logoUrl, alt: settings.logoAlt || settings.siteTitle }
      : null);
  const highlights = settings.profile.highlights.slice(0, 2);
  const newsletterLabel =
    settings.primaryMenu.find((item) => item.url === "/newsletter")?.title || "Newsletter";

  return (
    <section className="section-space pt-0">
      <div className="container grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h2 className="mt-2 text-[2.45rem] leading-[0.96] tracking-[-0.04em] md:text-[3.85rem]">
                {copy.title}
              </h2>
              {copy.description ? (
                <p className="mt-3 max-w-3xl text-[1rem] leading-8 text-foreground/82">
                  {copy.description}
                </p>
              ) : null}
            </div>
            <Link href="/blog" className="hidden text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground transition hover:text-primary md:inline-flex">
              {copy.archiveLabel}
            </Link>
          </div>

          <div>
            {posts.map((post) => (
              <EditorialListItem
                key={post.id}
                post={post}
                categoryLabel={categoryMap.get(post.categories[0] ?? -1)}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-28">
          <div className="editorial-panel space-y-5 p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border/70">
                {profileImage ? (
                  <ImageWrapper
                    image={profileImage}
                    alt={settings.siteTitle}
                    fill
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary font-serif text-xl text-foreground">
                    M
                  </div>
                )}
              </div>
              <div>
                {copy.profileCardEyebrow ? <p className="eyebrow">{copy.profileCardEyebrow}</p> : null}
                <p className="font-serif text-[2.1rem] leading-none tracking-[-0.035em]">
                  {settings.siteTitle}
                </p>
              </div>
            </div>

            {settings.profile.title ? (
              <p className="font-serif text-[1.6rem] leading-[1.05] tracking-[-0.02em] text-foreground">
                {settings.profile.title}
              </p>
            ) : null}

            <p className="text-[1.02rem] leading-8 text-foreground/82">{profileSummary}</p>

            {highlights.length ? (
              <ul className="grid gap-3 border-t border-border/70 pt-4">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.95rem] leading-7 text-foreground/82">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {settings.profile.primaryLinkUrl ? (
              <Link href={settings.profile.primaryLinkUrl} className="soft-link">
                {settings.profile.primaryLinkLabel || copy.profileCtaLabel}
              </Link>
            ) : null}
          </div>

          <div className="editorial-panel space-y-4 p-6">
            <div className="space-y-2">
              <p className="eyebrow">{settings.pageCopy.newsletterPage.eyebrow || settings.newsletter.eyebrow}</p>
              <h3 className="text-[2.25rem] leading-[0.98] tracking-[-0.035em]">
                {settings.pageCopy.newsletterPage.title || newsletterLabel}
              </h3>
              <p>
                {settings.pageCopy.newsletterPage.description || settings.newsletter.description}
              </p>
            </div>
            <Link href="/newsletter" className="soft-link">
              {newsletterLabel}
            </Link>
          </div>

          <div className="editorial-panel space-y-5 p-6">
            <div>
              <p className="eyebrow">{copy.browseEyebrow}</p>
              <div className="mt-4 flex flex-col gap-3">
                {browseLinks.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    target={item.target || (item.url.startsWith("http") ? "_blank" : undefined)}
                    rel={item.url.startsWith("http") ? "noreferrer" : undefined}
                    className="font-serif text-[1.55rem] leading-[1.08] tracking-[-0.02em] text-foreground transition hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {settings.socialLinks.length ? (
              <div>
                <p className="eyebrow">Elsewhere</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {settings.socialLinks.map((item) => (
                    <SocialIconLink key={item.label} label={item.label} url={item.url} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
