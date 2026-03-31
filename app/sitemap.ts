import type { MetadataRoute } from "next";

import { getIndexableContent, getSiteSettings } from "@/lib/api/wordpress";
import { LETTER_COLLECTIONS } from "@/lib/letters";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, content] = await Promise.all([
    getSiteSettings(),
    getIndexableContent(),
  ]);

  const staticRoutes = [
    "",
    "/about",
    "/blog",
    ...LETTER_COLLECTIONS.map((collection) => collection.path),
    "/resources",
    "/contact",
    "/newsletter",
    "/reviews",
    "/privacy-policy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: route ? absoluteUrl(route) : settings.siteUrl || absoluteUrl(),
      lastModified: new Date(),
    })),
    ...content.posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.modified || post.date,
    })),
  ];
}
