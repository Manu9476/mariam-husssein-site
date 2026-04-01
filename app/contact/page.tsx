import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPageBySlug, getSiteSettings } from "@/lib/api/wordpress";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(), getPageBySlug("contact")]);

  const seo = resolveSeoCopy({
    title: page?.title || "Contact",
    excerpt: page?.excerpt,
    seo: page?.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPageBySlug("contact")]);
  const copy = settings.pageCopy.contact;

  return (
    <section className="section-space">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={page?.title || copy.title || "Let's start a thoughtful conversation."}
            description={
              page?.excerpt?.replace(/<[^>]*>/g, "") ||
              copy.description
            }
          />

          {page?.content ? <RichTextRenderer content={page.content} /> : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="editorial-panel p-5">
              <p className="eyebrow">{copy.emailLabel}</p>
              {settings.contact.email ? (
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="mt-3 block font-serif text-2xl text-foreground"
                >
                  {settings.contact.email}
                </a>
              ) : (
                <p className="mt-3 font-serif text-2xl text-foreground">Available on request</p>
              )}
            </div>
            <div className="editorial-panel p-5">
              <p className="eyebrow">{copy.locationLabel}</p>
              <p className="mt-3 font-serif text-2xl text-foreground">
                {settings.contact.location || "Worldwide"}
              </p>
            </div>
            <div className="editorial-panel p-5">
              <p className="eyebrow">{copy.availabilityLabel}</p>
              <p className="mt-3 font-serif text-2xl text-foreground">
                {settings.contact.availability || "Open to thoughtful collaborations"}
              </p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
