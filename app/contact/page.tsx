import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import { getPageBySlug, getSiteSettings } from "@/lib/api/wordpress";

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

  return (
    <section className="section-space">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Contact 💌"
            title={page?.title || "Let's start a thoughtful conversation."}
            description={
              page?.excerpt.replace(/<[^>]*>/g, "") ||
              "Use WordPress to manage contact copy and details."
            }
          />

          {page?.content ? <RichTextRenderer content={page.content} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="editorial-panel p-5">
              <p className="eyebrow">Email ✉️</p>
              {settings.contact.email ? (
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="mt-3 block font-serif text-2xl text-foreground"
                >
                  {settings.contact.email}
                </a>
              ) : (
                <p className="mt-3 font-serif text-2xl text-foreground">
                  Add an email in Mariam Brand settings
                </p>
              )}
            </div>
            <div className="editorial-panel p-5">
              <p className="eyebrow">Location 📍</p>
              <p className="mt-3 font-serif text-2xl text-foreground">
                {settings.contact.location || "Add a location in Mariam Brand settings"}
              </p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
