import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import { getFaqs, getPageBySlug, getSiteSettings, getTestimonials } from "@/lib/api/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(), getPageBySlug("about")]);

  const seo = resolveSeoCopy({
    title: page?.title || "About",
    excerpt: page?.excerpt,
    seo: page?.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image,
    path: "/about",
  });
}

export default async function AboutPage() {
  const [page, faqs, testimonials] = await Promise.all([
    getPageBySlug("about"),
    getFaqs(),
    getTestimonials(3),
  ]);

  if (!page) {
    return (
      <div className="container section-space">
        <EmptyState
          title="The About page is not published yet"
          description="Create a WordPress page with the slug about to populate this section."
        />
      </div>
    );
  }

  return (
    <>
      <section className="section-space">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="overflow-hidden rounded-md border border-border/80 bg-white shadow-sm">
            <ImageWrapper image={page.image} alt={page.title} className="aspect-[4/5]" />
          </div>
          <div className="space-y-6">
            <SectionHeading
              eyebrow="About"
              title={page.title}
              description={page.excerpt.replace(/<[^>]*>/g, "")}
            />
            <RichTextRenderer content={page.content} />
          </div>
        </div>
      </section>

      {faqs.length ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow="FAQ"
              title="A few helpful answers."
              description="These FAQs are managed in WordPress and can support media kits, collaborations, and common questions."
            />
            <div className="grid gap-5 md:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.id} className="editorial-panel p-5">
                  <h3 className="text-2xl">{faq.question}</h3>
                  <RichTextRenderer content={faq.answer} className="mt-4 text-sm" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {testimonials.length ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow="In good company"
              title="A few kind words."
              description="Approved testimonials from readers, collaborators, and clients."
            />
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="editorial-panel p-5">
                  <RichTextRenderer content={testimonial.quote} className="text-sm" />
                  <p className="mt-5 font-serif text-2xl">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
