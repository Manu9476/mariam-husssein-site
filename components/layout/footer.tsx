import Link from "next/link";

import { SocialIconLink } from "@/components/shared/social-icon-link";
import { Separator } from "@/components/ui/separator";
import type { SiteSettings } from "@/types/wordpress";

export function Footer({
  settings,
}: {
  settings: SiteSettings;
}) {
  const footerLinks = [...settings.primaryMenu, ...settings.footerMenu].filter(
    (item, index, array) => array.findIndex((entry) => entry.url === item.url) === index,
  );
  const copyright =
    settings.footer.copyright?.replace(/^Ãƒâ€šÃ‚Â©|^Ã‚Â©/, "©") ||
    `© ${new Date().getFullYear()} ${settings.siteTitle}. All rights reserved.`;

  return (
    <footer className="relative border-t border-border/70 bg-white/80 py-14 md:py-18">
      <div className="container space-y-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            {settings.header.eyebrow ? <p className="eyebrow">{settings.header.eyebrow}</p> : null}
            <div className="space-y-3">
              <p className="brand-forest font-serif text-[2.8rem] font-bold leading-[0.92] tracking-[-0.04em] md:text-[3.6rem]">
                {settings.siteTitle}
              </p>
              <p className="max-w-2xl text-[1rem] leading-8">
                {settings.footer.blurb || settings.siteDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {settings.socialLinks.map((item) => (
                <SocialIconLink key={item.label} label={item.label} url={item.url} />
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <p className="eyebrow">Navigate</p>
              <div className="flex flex-col gap-3">
                {footerLinks.map((item) => (
                  <Link
                    key={`${item.id}-${item.url}`}
                    href={item.url}
                    target={item.target || (item.url.startsWith("http") ? "_blank" : undefined)}
                    rel={item.url.startsWith("http") ? "noreferrer" : undefined}
                    className="nav-link text-left text-[12px]"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="eyebrow">Connect</p>
              <div className="space-y-3 text-sm text-muted-foreground">
                {settings.contact.email ? (
                  <p>
                    <a href={`mailto:${settings.contact.email}`} className="soft-link">
                      {settings.contact.email}
                    </a>
                  </p>
                ) : null}
                {settings.contact.location ? <p>{settings.contact.location}</p> : null}
                {settings.contact.availability ? <p>{settings.contact.availability}</p> : null}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{copyright}</p>
          <p>{settings.siteUrl.replace(/^https?:\/\//, "")}</p>
        </div>
      </div>
    </footer>
  );
}
