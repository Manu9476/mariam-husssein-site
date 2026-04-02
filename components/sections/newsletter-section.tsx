import Link from "next/link";

import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import type { SiteSettings } from "@/types/wordpress";

export function NewsletterSection({
  settings,
}: {
  settings: SiteSettings;
}) {
  const newsletterLabel =
    settings.primaryMenu.find((item) => item.url === "/newsletter")?.title || "Newsletter";

  return (
    <section className="section-space">
      <div className="container">
        <FadeIn>
          <div className="overflow-hidden rounded-[2.25rem] border border-border/80 bg-white/85 shadow-soft">
            <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <SectionHeading
                eyebrow={settings.pageCopy.newsletterPage.eyebrow || settings.newsletter.eyebrow}
                title={settings.pageCopy.newsletterPage.title || newsletterLabel}
                description={settings.pageCopy.newsletterPage.description || settings.newsletter.description}
              />
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-border/80 bg-secondary/40 p-5">
                  <Link href="/newsletter" className="soft-link">
                    {newsletterLabel}
                  </Link>
                </div>
                {settings.newsletter.disclaimer ? (
                  <p className="text-sm text-muted-foreground">
                    {settings.newsletter.disclaimer}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
