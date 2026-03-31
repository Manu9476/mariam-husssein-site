import Link from "next/link";

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
    settings.footer.copyright?.replace(/^Ã‚Â©|^Â©/, "©") ||
    `© ${new Date().getFullYear()} ${settings.siteTitle}. All rights reserved.`;

  return (
    <footer className="border-t border-[#d7eadf] bg-[#f6fbf8] py-10">
      <div className="container space-y-8">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <p className="brand-forest font-serif text-3xl font-bold leading-none">
            {settings.siteTitle}
          </p>
          <p className="mx-auto max-w-2xl">
            {settings.footer.blurb || settings.siteDescription}
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {footerLinks.map((item) => (
              <Link
                key={`${item.id}-${item.url}`}
                href={item.url}
                target={item.target || (item.url.startsWith("http") ? "_blank" : undefined)}
                rel={item.url.startsWith("http") ? "noreferrer" : undefined}
                className="nav-link text-[12px]"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{copyright}</p>
          <p>{settings.contact.location}</p>
        </div>
      </div>
    </footer>
  );
}
