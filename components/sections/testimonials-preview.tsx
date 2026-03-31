import Link from "next/link";

import { TestimonialCard } from "@/components/content/testimonial-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { TestimonialEntry } from "@/types/content";

export function TestimonialsPreview({
  testimonials,
}: {
  testimonials: TestimonialEntry[];
}) {
  return (
    <section className="section-space">
      <div className="container space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Kind words"
            title="Warm reflections from readers, collaborators, and clients."
            description="Only approved testimonials appear here. New submissions can be reviewed in your CMS."
          />
          <Button asChild variant="outline">
            <Link href="/reviews">View all reviews</Link>
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
