import Link from "next/link";
import { Search } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinkItem } from "@/components/layout/nav-link-item";
import { SocialIconLink } from "@/components/shared/social-icon-link";
import type { SiteSettings } from "@/types/wordpress";

export function Header({
  settings,
}: {
  settings: SiteSettings;
}) {
  const headerSocialLinks = settings.socialLinks.slice(0, 3);
  const monogram = settings.header.monogram || settings.siteTitle.charAt(0);

  return (
    <header className="header-shell sticky top-0 z-40 border-b border-border/70">
      <div className="container py-3 md:py-4">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 px-4 py-3 shadow-soft backdrop-blur md:px-6">
          <div className="hidden items-center gap-6 lg:grid lg:grid-cols-[auto_1fr_auto]">
            <Link href="/" className="flex items-center gap-4">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={settings.logoAlt || settings.siteTitle}
                  className="h-12 w-12 rounded-full border border-white/80 object-cover shadow-sm"
                />
              ) : (
                <div className="brand-forest flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-white font-serif text-lg shadow-sm">
                  {monogram}
                </div>
              )}
              <div className="min-w-0">
                {settings.header.eyebrow ? (
                  <p className="brand-forest text-[11px] font-semibold uppercase tracking-[0.24em] opacity-75">
                    {settings.header.eyebrow}
                  </p>
                ) : null}
                <p className="brand-forest truncate font-serif text-[1.75rem] leading-none tracking-[-0.03em]">
                  {settings.siteTitle}
                </p>
              </div>
            </Link>

            <nav className="flex items-center justify-center gap-7 xl:gap-8">
              {settings.primaryMenu.map((item) => (
                <NavLinkItem
                  key={item.id}
                  item={item}
                  className="nav-link"
                  activeClassName="nav-link-active"
                />
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              {headerSocialLinks.map((item) => (
                <SocialIconLink key={item.label} label={item.label} url={item.url} className="h-10 w-10" />
              ))}
              <Link
                href="/blog"
                aria-label="Search the notes"
                className="brand-forest inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 lg:hidden">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={settings.logoAlt || settings.siteTitle}
                  className="h-11 w-11 rounded-full border border-white/80 object-cover shadow-sm"
                />
              ) : (
                <div className="brand-forest flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-white font-serif text-base shadow-sm">
                  {monogram}
                </div>
              )}
              <div className="min-w-0">
                <span className="brand-forest block truncate font-serif text-[1.7rem] font-bold leading-none tracking-tight">
                  {settings.siteTitle}
                </span>
                <span className="brand-forest block text-[11px] uppercase tracking-[0.24em] opacity-75 transition group-hover:text-primary">
                  {settings.header.mobileLabel || settings.header.eyebrow || "Editorial brand site"}
                </span>
              </div>
            </Link>

            <MobileNav
              items={settings.primaryMenu}
              socialLinks={settings.socialLinks}
              siteTitle={settings.siteTitle}
              description={settings.profile.summary || settings.siteDescription}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
