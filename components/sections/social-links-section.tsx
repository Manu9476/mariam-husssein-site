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

  const copy = settings.home.social;

  return (
    <section className="section-space pt-0">
      <FadeIn className="container">
        <div className="overflow-hidden rounded-[2.25rem] border border-border/80 bg-white/85 shadow-soft">
          <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="space-y-4">
              <p className="eyebrow">{copy.eyebrow}</p>
              <h2 className="text-[2.6rem] leading-[0.94] tracking-[-0.045em] md:text-[4rem]">
                {copy.title}
              </h2>
              <p className="max-w-xl text-[1rem] leading-8 text-foreground/82 md:text-[1.08rem]">
                {copy.description}
              </p>
              {settings.contact.email ? (
                <p className="text-sm text-muted-foreground">
                  {copy.emailLabel ? `${copy.emailLabel}: ` : ""}
                  <a href={`mailto:${settings.contact.email}`} className="soft-link">
                    {settings.contact.email}
                  </a>
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {settings.socialLinks.map((item) => (
                <div
                  key={item.label}
                  className="group rounded-[1.4rem] border border-border/80 bg-secondary/30 p-5 transition hover:-translate-y-1 hover:border-primary/25 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-serif text-[1.5rem] tracking-[-0.02em] text-foreground">
                      {item.label}
                    </span>
                    <SocialIconLink label={item.label} url={item.url} className="h-11 w-11" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
