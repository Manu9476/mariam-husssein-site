import { FadeIn } from "@/components/shared/fade-in";
import { SocialIconLink } from "@/components/shared/social-icon-link";
import type { SiteSettings } from "@/types/wordpress";

export function SocialLinksSection({
  settings,
}: {
  settings: SiteSettings;
}) {
  if (!settings.socialLinks.length) {
    return null;
  }

  return (
    <section className="bg-secondary/20 py-12 md:py-16">
      <FadeIn className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Stay in touch ✨</p>
          <h2 className="mt-3 text-[2.5rem] leading-none md:text-[4rem]">
            Keep up with Mariam online.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base md:text-[1.05rem]">
            Follow along for thoughtful updates, new writing, resources, and everyday inspiration.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {settings.socialLinks.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <SocialIconLink label={item.label} url={item.url} className="h-12 w-12" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {settings.contact.email ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Email:{" "}
              <a
                href={`mailto:${settings.contact.email}`}
                className="font-medium text-foreground underline decoration-border underline-offset-4"
              >
                {settings.contact.email}
              </a>
            </p>
          ) : null}
        </div>
      </FadeIn>
    </section>
  );
}
