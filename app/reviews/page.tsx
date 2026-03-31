import type { Metadata } from "next";

import { ReviewSubmissionForm } from "@/components/forms/review-submission-form";
import { TestimonialCard } from "@/components/content/testimonial-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import { getPageBySlug, getSiteSettings, getTestimonials } from "@/lib/api/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(), getPageBySlug("reviews")]);

  const seo = resolveSeoCopy({
    title: page?.title || "Reviews",
    excerpt: page?.excerpt,
    seo: page?.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image,
    path: "/reviews",
  });
}

export default async function ReviewsPage() {
  const [page, testimonials] = await Promise.all([
    getPageBySlug("reviews"),
    getTestimonials(100),
  ]);

  return (
    <>
      <section className="section-space">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
          <SectionHeading
            eyebrow="Reviews ♡"
            title={page?.title || "Kind words and thoughtful feedback."}
            description={
                page?.excerpt.replace(/<[^>]*>/g, "") ||
                "Website visitors can submit new testimonials here. Every submission is moderated in WordPress before publication."
              }
            />
            {page?.content ? <RichTextRenderer content={page.content} /> : null}
          </div>
          <ReviewSubmissionForm />
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container">
          {testimonials.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No public reviews yet"
              description="Approved testimonials will appear here after you publish them from WordPress."
            />
          )}
        </div>
      </section>
    </>
  );
}
