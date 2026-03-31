import type { Metadata } from "next";

import { absoluteUrl, stripHtml } from "@/lib/utils";
import type { SeoFields } from "@/types/content";
import type { SiteSettings } from "@/types/wordpress";

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function buildMetadata(
  settings: SiteSettings,
  options: MetadataOptions = {},
): Metadata {
  const title = options.title
    ? `${options.title} | ${settings.siteTitle}`
    : settings.siteTitle;
  const description = options.description || settings.siteDescription;
  const url = absoluteUrl(options.path);
  const image = options.image || settings.logoUrl || absoluteUrl("/og-image.svg");

  return {
    metadataBase: new URL(settings.siteUrl || absoluteUrl()),
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: options.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      url,
      siteName: settings.siteTitle,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function resolveSeoCopy({
  title,
  excerpt,
  seo,
}: {
  title: string;
  excerpt?: string;
  seo?: SeoFields;
}) {
  return {
    title: seo?.title || title,
    description: seo?.description || stripHtml(excerpt),
    image: seo?.ogImage,
  };
}
