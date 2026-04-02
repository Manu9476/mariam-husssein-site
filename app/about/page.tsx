import type { Metadata } from "next";

import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import { ResumeHighlightSection } from "@/components/sections/resume-highlight-section";
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
  const [settings, page, faqs, testimonials] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("about"),
    getFaqs(),
    getTestimonials(3),
  ]);
  const copy = settings.pageCopy.about;
  const portrait =
    page?.image ??
    (settings.logoUrl
      ? { url: settings.logoUrl, alt: settings.logoAlt || settings.siteTitle }
      : null);
  const fallbackBody = settings.profile.summary
    ? `<p>${settings.profile.summary}</p>`
    : "";

  return (
    <>
      <section className="section-space">
        <div
          className={`container grid gap-8 lg:items-start ${
            portrait?.url ? "lg:grid-cols-[0.9fr_1.1fr]" : ""
          }`}
        >
          {portrait?.url ? (
            <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-white shadow-soft">
              <ImageWrapper image={portrait} alt={page?.title || settings.siteTitle} className="aspect-[4/5]" />
            </div>
          ) : null}
          <div className="space-y-6">
            <SectionHeading
              eyebrow={copy.eyebrow}
              title={page?.title || settings.profile.title || settings.siteTitle}
              description={page?.excerpt?.replace(/<[^>]*>/g, "") || settings.siteDescription}
            />
            <RichTextRenderer content={page?.content || fallbackBody} />
          </div>
        </div>
      </section>

      <ResumeHighlightSection settings={settings} compact />

      {faqs.length ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow={copy.faqEyebrow}
              title={copy.faqTitle || "A few helpful answers."}
              description={copy.faqDescription}
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
              eyebrow={copy.testimonialsEyebrow}
              title={copy.testimonialsTitle || "A few kind words."}
              description={copy.testimonialsDescription}
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
