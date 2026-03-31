import Link from "next/link";
import { Search } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SocialIconLink } from "@/components/shared/social-icon-link";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/types/wordpress";

export function Header({
  settings,
}: {
  settings: SiteSettings;
}) {
  const headerSocialLinks = settings.socialLinks.slice(0, 3);

  return (
    <header className="header-shell sticky top-0 z-40 border-b border-[#a7ccb6]">
      <div className="header-shell border-b border-[#a7ccb6]">
        <div className="container hidden h-24 items-center md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="flex items-center gap-4">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={settings.logoAlt || settings.siteTitle}
                className="h-12 w-12 rounded-full border border-white/80 object-cover shadow-sm"
              />
            ) : (
              <div className="brand-forest flex h-12 w-12 items-center justify-center rounded-full border border-white/90 bg-white font-serif text-lg shadow-sm">
                M
              </div>
            )}
            <div className="min-w-0">
              <p className="brand-forest text-[11px] font-semibold uppercase tracking-[0.24em] opacity-80">
                Personal brand
              </p>
              <p className="brand-forest truncate font-serif text-[1.9rem] tracking-[-0.03em]">
                {settings.siteTitle}
              </p>
            </div>
          </Link>

          <Link href="/" className="brand-forest justify-self-center font-serif text-[3.25rem] font-bold leading-none tracking-[-0.045em] lg:text-[3.9rem]">
            {settings.siteTitle}
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {headerSocialLinks.map((item) => (
              <SocialIconLink key={item.label} label={item.label} url={item.url} />
            ))}
            <Link
              href="/blog"
              aria-label="Search the journal"
              className="brand-forest inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Button asChild>
              <Link href="/newsletter">Subscribe</Link>
            </Button>
          </div>
        </div>

        <div className="container flex h-16 items-center justify-between gap-6 md:hidden">
          <Link href="/" className="group inline-flex flex-col">
            <span className="brand-forest font-serif text-2xl font-bold leading-none tracking-tight">
              {settings.siteTitle}
            </span>
            <span className="brand-forest text-[11px] uppercase tracking-[0.24em] opacity-80 transition group-hover:text-primary">
              Editorial brand site
            </span>
          </Link>

          <MobileNav
            items={settings.primaryMenu}
            socialLinks={settings.socialLinks}
            siteTitle={settings.siteTitle}
          />
        </div>
      </div>

      <div className="header-shell container hidden h-14 items-center justify-center gap-8 md:flex">
        <nav className="flex items-center gap-8">
          {settings.primaryMenu.map((item) => {
            const external = item.url.startsWith("http");

            return (
              <Link
                key={item.id}
                href={item.url}
                target={item.target || (external ? "_blank" : undefined)}
                rel={external ? "noreferrer" : undefined}
                className="nav-link"
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="header-shell container flex h-14 items-center justify-between gap-4 border-t border-[#a7ccb6] md:hidden">
        <div className="flex items-center gap-3">
          {headerSocialLinks.map((item) => (
            <SocialIconLink key={item.label} label={item.label} url={item.url} className="h-9 w-9" iconClassName="h-4 w-4" />
          ))}
        </div>
        <Button asChild size="sm">
          <Link href="/newsletter">Subscribe</Link>
        </Button>
      </div>
    </header>
  );
}
