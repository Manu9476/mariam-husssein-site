import Link from "next/link";

import { TestimonialCard } from "@/components/content/testimonial-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { TestimonialEntry } from "@/types/content";
import type { SiteSettings } from "@/types/wordpress";

export function TestimonialsPreview({
  testimonials,
  settings,
}: {
  testimonials: TestimonialEntry[];
  settings: SiteSettings;
}) {
  const copy = settings.home.testimonials;

  return (
    <section className="section-space">
      <div className="container space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
          <Button asChild variant="outline">
            <Link href="/reviews">{copy.ctaLabel}</Link>
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
