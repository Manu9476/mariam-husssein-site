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
  const infoRows = [
    {
      label: copy.emailLabel,
      value: settings.contact.email,
      href: settings.contact.email ? `mailto:${settings.contact.email}` : undefined,
      fallback: "Available on request",
    },
    {
      label: copy.locationLabel,
      value: settings.contact.location,
      fallback: "Worldwide",
    },
    {
      label: copy.availabilityLabel,
      value: settings.contact.availability,
      fallback: "Open to thoughtful collaborations",
    },
  ];

  return (
    <section className="section-space">
      <div className="container grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="space-y-6 lg:pr-6">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={page?.title || copy.title || "Let's start a thoughtful conversation."}
            description={
              page?.excerpt?.replace(/<[^>]*>/g, "") ||
              copy.description
            }
          />

          {page?.content ? (
            <div className="max-w-2xl">
              <RichTextRenderer content={page.content} />
            </div>
          ) : null}

          <div className="editorial-panel overflow-hidden p-0">
            {infoRows.map((item, index) => (
              <div
                key={item.label}
                className={[
                  "grid gap-2 px-5 py-4 md:grid-cols-[140px_1fr] md:items-start md:gap-6 md:px-6",
                  index < infoRows.length - 1 ? "border-b border-border/70" : "",
                ].join(" ")}
              >
                <p className="eyebrow pt-1">{item.label}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="font-serif text-lg leading-8 text-foreground md:text-[1.4rem]"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="max-w-xl font-serif text-lg leading-8 text-foreground md:text-[1.4rem]">
                    {item.value || item.fallback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
