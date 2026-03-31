import { FadeIn } from "@/components/shared/fade-in";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { SectionHeading } from "@/components/shared/section-heading";
import type { SiteSettings } from "@/types/wordpress";

export function NewsletterSection({
  settings,
}: {
  settings: SiteSettings;
}) {
  return (
    <section className="section-space">
      <div className="container">
        <FadeIn>
          <div className="editorial-panel grid gap-6 p-6 md:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <SectionHeading
              eyebrow={settings.newsletter.eyebrow}
              title={settings.newsletter.title}
              description={settings.newsletter.description}
            />
            <div className="space-y-4">
              <NewsletterForm
                placeholder={settings.newsletter.placeholder}
                buttonLabel={settings.newsletter.buttonLabel}
              />
              {settings.newsletter.disclaimer ? (
                <p className="text-sm text-muted-foreground">
                  {settings.newsletter.disclaimer}
                </p>
              ) : null}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
