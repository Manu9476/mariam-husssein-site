import { cache } from "react";

import {
  DEFAULT_REVALIDATE,
  DEFAULT_CONTACT_EMAIL,
  POSTS_PER_PAGE,
  TESTIMONIALS_PREVIEW_LIMIT,
} from "@/lib/constants";
import { isSanityConfigured, sanityClient } from "@/lib/sanity/client";
import {
  portableTextToHtml,
  portableTextToPlainText,
} from "@/lib/sanity/portable-text";
import { decodeHtml, stripHtml } from "@/lib/utils";
import type {
  CategorySummary,
  CommentEntry,
  ContentId,
  FaqEntry,
  ImageAsset,
  PageContent,
  PostSummary,
  ResourceEntry,
  TestimonialEntry,
} from "@/types/content";
import type {
  SanityCategoryDocument,
  SanityCommentDocument,
  SanityFaqDocument,
  SanityPageDocument,
  SanityPortableNode,
  SanityPostDocument,
  SanityResourceDocument,
  SanitySiteSettingsDocument,
  SanityTestimonialDocument,
} from "@/types/sanity";
import type {
  PaginatedResponse,
  SeoMetaFields,
  SiteSettings,
  WordPressCategory,
  WordPressFaq,
  WordPressPage,
  WordPressPost,
  WordPressResource,
  WordPressTestimonial,
} from "@/types/wordpress";

const wordpressBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, "");
const WORDPRESS_FETCH_TIMEOUT_MS = Number(
  process.env.WORDPRESS_FETCH_TIMEOUT_MS || 3500,
);

function normalizeContentIds(ids?: ContentId[]) {
  return (ids ?? []).map((id) => String(id)).filter(Boolean);
}

type FetchOptions = {
  query?: Record<string, string | number | boolean | undefined | null>;
  revalidate?: number;
  tags?: string[];
  init?: RequestInit;
};

function withWpJson(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/wp-json${normalized}`;
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
) {
  if (!wordpressBaseUrl) {
    return null;
  }

  const url = new URL(withWpJson(path), `${wordpressBaseUrl}/`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
}

async function wordpressFetch<T>(
  path: string,
  { query, revalidate = DEFAULT_REVALIDATE, tags = [], init }: FetchOptions = {},
) {
  const url = buildUrl(path, query);

  if (!url) {
    throw new Error("NEXT_PUBLIC_WORDPRESS_URL is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WORDPRESS_FETCH_TIMEOUT_MS);
  const abortListener = () => controller.abort();

  if (init?.signal) {
    if (init.signal.aborted) {
      controller.abort();
    } else {
      init.signal.addEventListener("abort", abortListener, { once: true });
    }
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      next: {
        revalidate,
        tags,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `WordPress request timed out after ${WORDPRESS_FETCH_TIMEOUT_MS}ms.`,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    init?.signal?.removeEventListener("abort", abortListener);
  }

  if (!response.ok) {
    throw new Error(
      `WordPress request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as T;

  return {
    data,
    headers: response.headers,
  };
}

function readingTimeFromHtml(content?: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function resolveImage(node: {
  _embedded?: {
    "wp:featuredmedia"?: {
      source_url: string;
      alt_text?: string;
      media_details?: {
        width?: number;
        height?: number;
      };
    }[];
  };
}): ImageAsset | null {
  const media = node._embedded?.["wp:featuredmedia"]?.[0];

  if (!media?.source_url) {
    return null;
  }

  return {
    url: media.source_url,
    alt: media.alt_text || "Editorial image",
    width: media.media_details?.width,
    height: media.media_details?.height,
  };
}

function resolveSanityImage(image?: {
  alt?: string;
  asset?: {
    url?: string;
    metadata?: {
      dimensions?: {
        width?: number;
        height?: number;
      };
    };
  };
} | null): ImageAsset | null {
  if (!image?.asset?.url) {
    return null;
  }

  return {
    url: image.asset.url,
    alt: image.alt || "Editorial image",
    width: image.asset.metadata?.dimensions?.width,
    height: image.asset.metadata?.dimensions?.height,
  };
}

function resolveSeo(meta?: SeoMetaFields): {
  title?: string;
  description?: string;
  ogImage?: string;
} {
  return {
    title: meta?._mh_seo_title,
    description: meta?._mh_seo_description,
    ogImage: meta?._mh_og_image,
  };
}

function mapPost(post: WordPressPost): PostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: decodeHtml(post.title?.rendered),
    excerpt: post.excerpt?.rendered || "",
    content: post.content?.rendered || "",
    date: post.date || "",
    modified: post.modified,
    authorName: post._embedded?.author?.[0]?.name,
    categories: post.categories ?? [],
    image: resolveImage(post),
    seo: resolveSeo(post.meta),
    sticky: Boolean(post.sticky || post.meta?._mh_featured_on_home),
    readingTime: readingTimeFromHtml(post.content?.rendered),
    commentCount: 0,
  };
}

function mapPage(page: WordPressPage): PageContent {
  return {
    id: page.id,
    slug: page.slug,
    title: decodeHtml(page.title?.rendered),
    content: page.content?.rendered || "",
    excerpt: page.excerpt?.rendered || "",
    image: resolveImage(page),
    seo: resolveSeo(page.meta),
  };
}

function mapCategory(category: WordPressCategory): CategorySummary {
  return {
    id: category.id,
    count: category.count,
    name: category.name,
    slug: category.slug,
    description: category.description,
  };
}

function mapFaq(entry: WordPressFaq): FaqEntry {
  return {
    id: entry.id,
    slug: entry.slug,
    question: decodeHtml(entry.title?.rendered),
    answer: entry.content?.rendered || "",
  };
}

function mapResource(entry: WordPressResource): ResourceEntry {
  return {
    id: entry.id,
    slug: entry.slug,
    title: decodeHtml(entry.title?.rendered),
    excerpt: entry.excerpt?.rendered || "",
    content: entry.content?.rendered || "",
    ctaLabel: entry.meta?._mh_resource_cta_label || "Learn more",
    ctaUrl: entry.meta?._mh_resource_url,
    highlight: Boolean(entry.meta?._mh_resource_highlight),
    image: resolveImage(entry),
    seo: resolveSeo(entry.meta),
  };
}

function mapTestimonial(entry: WordPressTestimonial): TestimonialEntry {
  return {
    id: entry.id,
    slug: entry.slug,
    name: entry.meta?._mh_submitter_name || decodeHtml(entry.title?.rendered),
    quote: entry.content?.rendered || "",
    rating: Number(entry.meta?._mh_testimonial_rating || 5),
    image: resolveImage(entry),
    seo: resolveSeo(entry.meta),
  };
}

function normalizeRichText(content?: SanityPortableNode[] | null, excerpt?: string) {
  const html = portableTextToHtml(content);
  const plain = excerpt || portableTextToPlainText(content);

  return {
    html,
    plain,
  };
}

function mapSanitySeo(seo?: {
  title?: string;
  description?: string;
  ogImage?: string;
}) {
  return {
    title: seo?.title,
    description: seo?.description,
    ogImage: seo?.ogImage,
  };
}

function mapSanityMenu(
  items: { _key?: string; title: string; url: string; target?: string }[] = [],
) {
  return items
    .filter((item) => item?.title && item?.url)
    .map((item, index) => ({
      id: item._key || index + 1,
      title: item.title,
      url: item.url,
      target: item.target,
    }));
}

function mapSanityPage(page: SanityPageDocument): PageContent {
  const richText = normalizeRichText(page.body, page.excerpt);

  return {
    id: page._id,
    slug: page.slug,
    title: page.title,
    content: richText.html,
    excerpt: page.excerpt || richText.plain,
    image: resolveSanityImage(page.featuredImage),
    seo: mapSanitySeo(page.seo),
  };
}

function mapSanityCategory(
  category: SanityCategoryDocument & { postCount?: number },
): CategorySummary {
  return {
    id: category._id,
    count: category.postCount || 0,
    name: category.title,
    slug: category.slug,
    description: category.description || "",
  };
}

function mapSanityPost(post: SanityPostDocument): PostSummary {
  const richText = normalizeRichText(post.body, post.excerpt);

  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || richText.plain,
    content: richText.html,
    date: post.publishedAt || "",
    modified: post.updatedAt,
    authorName: post.authorName,
    categories: (post.categories ?? []).map((category) => category._id),
    image: resolveSanityImage(post.featuredImage),
    seo: mapSanitySeo(post.seo),
    sticky: Boolean(post.featuredOnHome),
    readingTime: readingTimeFromHtml(richText.html),
    commentCount: post.commentCount || 0,
  };
}

function mapSanityFaq(entry: SanityFaqDocument): FaqEntry {
  return {
    id: entry._id,
    slug: entry.slug,
    question: entry.question,
    answer: portableTextToHtml(entry.answer),
  };
}

function mapSanityResource(entry: SanityResourceDocument): ResourceEntry {
  const richText = normalizeRichText(entry.body, entry.excerpt);

  return {
    id: entry._id,
    slug: entry.slug,
    title: entry.title,
    excerpt: entry.excerpt || richText.plain,
    content: richText.html,
    ctaLabel: entry.ctaLabel || "Learn more",
    ctaUrl: entry.ctaUrl,
    highlight: Boolean(entry.highlight),
    image: resolveSanityImage(entry.featuredImage),
    seo: mapSanitySeo(entry.seo),
  };
}

function mapSanityTestimonial(entry: SanityTestimonialDocument): TestimonialEntry {
  return {
    id: entry._id,
    slug: entry.slug,
    name: entry.name,
    quote: entry.quote || "",
    rating: Number(entry.rating || 5),
    image: resolveSanityImage(entry.image),
    seo: mapSanitySeo(entry.seo),
  };
}

function mapSanityComment(entry: SanityCommentDocument): CommentEntry {
  return {
    id: entry._id,
    postId: entry.post?._id || "",
    parentId: entry.parentComment?._id,
    name: entry.name,
    message: entry.message || "",
    date: entry.createdAt || "",
    approved: Boolean(entry.approved),
    replies: [],
  };
}

function fallbackSettings(): SiteSettings {
  return {
    siteTitle: "Mariam Husssein",
    siteDescription:
      "A soft editorial home for thoughtful writing, personal reflections, and resources.",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logoUrl: null,
    logoAlt: "Mariam Husssein",
    primaryMenu: [
      { id: 1, title: "Home", url: "/" },
      { id: 2, title: "Letters", url: "/letters/younger-me" },
      { id: 3, title: "Notes", url: "/blog" },
      { id: 4, title: "Newsletter", url: "/newsletter" },
      { id: 5, title: "Resources", url: "/resources" },
      { id: 6, title: "Archive", url: "/blog" },
      { id: 7, title: "About", url: "/about" },
      { id: 8, title: "Contact", url: "/contact" },
      { id: 9, title: "Studio", url: "/studio" },
    ],
    footerMenu: [
      { id: 1, title: "Newsletter", url: "/newsletter" },
      { id: 2, title: "Privacy Policy", url: "/privacy-policy" },
      { id: 3, title: "Terms", url: "/terms" },
    ],
    hero: {
      eyebrow: "Editorial notes",
      title: "A calm digital home for stories, lessons, and generous living.",
      subtitle:
        "Now connected to a free Sanity content studio, so you can manage sections, pages, stories, and letters without touching code.",
      primaryCtaLabel: "Read the journal",
      primaryCtaUrl: "/blog",
      secondaryCtaLabel: "About Mariam",
      secondaryCtaUrl: "/about",
    },
    newsletter: {
      eyebrow: "Stay close",
      title: "Letters worth slowing down for.",
      description:
        "Use Sanity Studio to tailor this invitation, then connect Beehiiv, ConvertKit, or Mailchimp when you are ready.",
      placeholder: "Enter your email address",
      buttonLabel: "Subscribe",
      disclaimer: "No spam. Just thoughtful updates, occasional recommendations, and new essays.",
    },
    contact: {
      email: DEFAULT_CONTACT_EMAIL,
      phone: "+254 700 000 000",
      location: "Nairobi, Kenya",
      availability: "Open to speaking, partnerships, and thoughtful collaborations.",
    },
    socialLinks: [
      { label: "Website", url: "https://example.com" },
      { label: "YouTube", url: "https://youtube.com" },
      { label: "Instagram", url: "https://instagram.com" },
    ],
    footer: {
      blurb:
        "An editorial space for personal essays, resources, and warm modern storytelling.",
      copyright: `© ${new Date().getFullYear()} Mariam Husssein. All rights reserved.`,
      newsletterCtaLabel: "Join the newsletter",
      newsletterCtaUrl: "/newsletter",
    },
  };
}

export function isWordPressConfigured() {
  return Boolean(wordpressBaseUrl);
}

async function sanityFetch<T>(
  query: string,
  params?: Record<string, string | number | boolean | string[] | null | undefined>,
) {
  if (!sanityClient) {
    throw new Error("Sanity is not configured.");
  }

  return sanityClient.fetch<T>(query, params ?? {}, {
    next: {
      revalidate: DEFAULT_REVALIDATE,
    },
  });
}

const bodyProjection = `
  body[]{
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  }
`;

const pageProjection = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  featuredImage{
    alt,
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  ${bodyProjection},
  seo{
    title,
    description,
    ogImage
  }
`;

const postProjection = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "publishedAt": coalesce(publishedAt, _createdAt),
  "updatedAt": _updatedAt,
  "authorName": author->name,
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current,
    description
  },
  featuredOnHome,
  "commentCount": count(*[_type == "comment" && approved == true && post._ref == ^._id]),
  featuredImage{
    alt,
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  ${bodyProjection},
  seo{
    title,
    description,
    ogImage
  }
`;

const resourceProjection = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  ctaLabel,
  ctaUrl,
  highlight,
  featuredImage{
    alt,
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  ${bodyProjection},
  seo{
    title,
    description,
    ogImage
  }
`;

const siteSettingsQuery = `
  *[_type == "siteSettings"][0]{
    siteTitle,
    siteDescription,
    siteUrl,
    logoAlt,
    logo{
      alt,
      asset->{
        url,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    },
    primaryMenu[]{
      _key,
      title,
      url,
      target
    },
    footerMenu[]{
      _key,
      title,
      url,
      target
    },
    hero{
      eyebrow,
      title,
      subtitle,
      primaryCtaLabel,
      primaryCtaUrl,
      secondaryCtaLabel,
      secondaryCtaUrl
    },
    newsletter{
      eyebrow,
      title,
      description,
      placeholder,
      buttonLabel,
      disclaimer
    },
    contact{
      email,
      phone,
      location,
      availability
    },
    socialLinks[]{
      _key,
      label,
      url
    },
    footer{
      blurb,
      copyright,
      newsletterCtaLabel,
      newsletterCtaUrl
    }
  }
`;

function mergeSettingsWithFallback(settings?: SanitySiteSettingsDocument | SiteSettings | null) {
  const fallback = fallbackSettings();

  if (!settings) {
    return fallback;
  }

  const sanitySettings = settings as SanitySiteSettingsDocument;
  const logo = resolveSanityImage(sanitySettings.logo);

  return {
    ...fallback,
    siteTitle: sanitySettings.siteTitle || fallback.siteTitle,
    siteDescription: sanitySettings.siteDescription || fallback.siteDescription,
    siteUrl: sanitySettings.siteUrl || fallback.siteUrl,
    logoUrl: logo?.url || fallback.logoUrl,
    logoAlt: sanitySettings.logoAlt || logo?.alt || fallback.logoAlt,
    primaryMenu:
      sanitySettings.primaryMenu?.length
        ? mapSanityMenu(sanitySettings.primaryMenu)
        : fallback.primaryMenu,
    footerMenu:
      sanitySettings.footerMenu?.length
        ? mapSanityMenu(sanitySettings.footerMenu)
        : fallback.footerMenu,
    hero: {
      ...fallback.hero,
      ...(sanitySettings.hero ?? {}),
    },
    newsletter: {
      ...fallback.newsletter,
      ...(sanitySettings.newsletter ?? {}),
    },
    contact: {
      ...fallback.contact,
      ...(sanitySettings.contact ?? {}),
    },
    socialLinks:
      sanitySettings.socialLinks?.filter((item) => item?.label && item?.url) ||
      fallback.socialLinks,
    footer: {
      ...fallback.footer,
      ...(sanitySettings.footer ?? {}),
    },
  };
}

const getSiteSettingsCached = cache(async (): Promise<SiteSettings> => {
  if (isSanityConfigured() && sanityClient) {
    try {
      const settings = await sanityFetch<SanitySiteSettingsDocument | null>(
        siteSettingsQuery,
      );

      return mergeSettingsWithFallback(settings);
    } catch {
      return fallbackSettings();
    }
  }

  if (!wordpressBaseUrl) {
    return fallbackSettings();
  }

  try {
    const { data } = await wordpressFetch<SiteSettings>("/mh-site/v1/settings", {
      tags: ["site-settings"],
    });

    return {
      ...fallbackSettings(),
      ...data,
    };
  } catch {
    return fallbackSettings();
  }
});

export async function getSiteSettings(): Promise<SiteSettings> {
  return getSiteSettingsCached();
}

const getPageBySlugCached = cache(async (slug: string): Promise<PageContent | null> => {
  if (isSanityConfigured() && sanityClient) {
    const query = `
      *[_type == "page" && slug.current == $slug][0]{
        ${pageProjection}
      }
    `;

    try {
      const page = await sanityFetch<SanityPageDocument | null>(query, { slug });
      return page ? mapSanityPage(page) : null;
    } catch {
      return null;
    }
  }

  if (!wordpressBaseUrl) {
    return null;
  }

  const { data } = await wordpressFetch<WordPressPage[]>("/wp/v2/pages", {
    query: {
      slug,
      _embed: true,
      status: "publish",
      per_page: 1,
    },
    tags: [`page:${slug}`],
  });

  const page = data[0];

  return page ? mapPage(page) : null;
});

export async function getPageBySlug(slug: string): Promise<PageContent | null> {
  return getPageBySlugCached(slug);
}

export async function getPageByPossibleSlugs(
  slugs: string[],
): Promise<PageContent | null> {
  const pages = await Promise.all(slugs.map((slug) => getPageBySlug(slug)));
  return pages.find(Boolean) ?? null;
}

const getPostsCached = cache(
  async (
    page: number,
    search: string,
    categoryId: ContentId,
    perPage: number,
    excludeCategoryIdsKey: string,
  ): Promise<PaginatedResponse<PostSummary>> => {
    const excludeCategoryIds = excludeCategoryIdsKey
      ? excludeCategoryIdsKey.split(",").filter(Boolean)
      : [];

    if (isSanityConfigured() && sanityClient) {
      const start = Math.max(0, (page - 1) * perPage);
      const end = start + perPage;
      const searchPattern = search ? `*${search}*` : null;
      const normalizedCategoryId = categoryId ? String(categoryId) : null;

      const filter = `
        _type == "post" &&
        defined(slug.current) &&
        (!defined($searchPattern) || title match $searchPattern || excerpt match $searchPattern || pt::text(body) match $searchPattern) &&
        (!defined($categoryId) || references($categoryId)) &&
        (count(categories[@._ref in $excludeCategoryIds]) == 0)
      `;

      try {
        const [items, totalItems] = await Promise.all([
          sanityFetch<SanityPostDocument[]>(
            `*[
              ${filter}
            ] | order(coalesce(publishedAt, _createdAt) desc)[$start...$end]{
              ${postProjection}
            }`,
            {
              searchPattern,
              categoryId: normalizedCategoryId,
              excludeCategoryIds,
              start,
              end,
            },
          ),
          sanityFetch<number>(
            `count(*[
              ${filter}
            ])`,
            {
              searchPattern,
              categoryId: normalizedCategoryId,
              excludeCategoryIds,
            },
          ),
        ]);

        return {
          items: items.map(mapSanityPost),
          totalPages: Math.ceil(totalItems / perPage),
          totalItems,
        };
      } catch {
        return {
          items: [],
          totalPages: 0,
          totalItems: 0,
        };
      }
    }

    if (!wordpressBaseUrl) {
      return {
        items: [],
        totalPages: 0,
        totalItems: 0,
      };
    }

    const { data, headers } = await wordpressFetch<WordPressPost[]>("/wp/v2/posts", {
      query: {
        _embed: true,
        page,
        per_page: perPage,
        status: "publish",
        search: search || undefined,
        categories: categoryId || undefined,
        categories_exclude: excludeCategoryIds.length
          ? excludeCategoryIds.join(",")
          : undefined,
      },
      tags: ["posts"],
    });

    return {
      items: data.map(mapPost),
      totalPages: Number(headers.get("X-WP-TotalPages") || 1),
      totalItems: Number(headers.get("X-WP-Total") || data.length),
    };
  },
);

export async function getPosts({
  page = 1,
  search,
  categoryId,
  perPage = POSTS_PER_PAGE,
  excludeCategoryIds,
}: {
  page?: number;
  search?: string;
  categoryId?: ContentId;
  perPage?: number;
  excludeCategoryIds?: ContentId[];
} = {}): Promise<PaginatedResponse<PostSummary>> {
  return getPostsCached(
    page,
    search ?? "",
    categoryId ?? "",
    perPage,
    normalizeContentIds(excludeCategoryIds).join(","),
  );
}

export async function getLatestPosts(
  limit = 3,
  excludeId?: ContentId,
  options?: {
    excludeCategoryIds?: ContentId[];
  },
) {
  const { items } = await getPosts({
    page: 1,
    perPage: Math.max(limit + (excludeId ? 1 : 0), limit),
    excludeCategoryIds: options?.excludeCategoryIds,
  });

  return items.filter((item) => item.id !== excludeId).slice(0, limit);
}

export async function getStickyFeaturedPost(options?: {
  excludeCategoryIds?: ContentId[];
}) {
  if (isSanityConfigured() && sanityClient) {
    const excludeCategoryIds = normalizeContentIds(options?.excludeCategoryIds);

    try {
      const post = await sanityFetch<SanityPostDocument | null>(
        `*[_type == "post" && defined(slug.current) && featuredOnHome == true && count(categories[@._ref in $excludeCategoryIds]) == 0]
          | order(coalesce(publishedAt, _createdAt) desc)[0]{
            ${postProjection}
          }`,
        {
          excludeCategoryIds,
        },
      );

      if (post) {
        return mapSanityPost(post);
      }
    } catch {
      return null;
    }

    const latest = await getLatestPosts(1, undefined, {
      excludeCategoryIds: options?.excludeCategoryIds,
    });
    return latest[0] ?? null;
  }

  if (!wordpressBaseUrl) {
    return null;
  }

  try {
    const { data } = await wordpressFetch<WordPressPost[]>("/wp/v2/posts", {
      query: {
        _embed: true,
        per_page: 1,
        sticky: true,
        status: "publish",
        categories_exclude: normalizeContentIds(options?.excludeCategoryIds).length
          ? normalizeContentIds(options?.excludeCategoryIds).join(",")
          : undefined,
      },
      tags: ["posts", "featured-post"],
    });

    if (data[0]) {
      return mapPost(data[0]);
    }
  } catch {
    return null;
  }

  const latest = await getLatestPosts(1, undefined, {
    excludeCategoryIds: options?.excludeCategoryIds,
  });
  return latest[0] ?? null;
}

const getPostBySlugCached = cache(async (slug: string) => {
  if (isSanityConfigured() && sanityClient) {
    try {
      const post = await sanityFetch<SanityPostDocument | null>(
        `*[_type == "post" && slug.current == $slug][0]{
          ${postProjection}
        }`,
        { slug },
      );

      return post ? mapSanityPost(post) : null;
    } catch {
      return null;
    }
  }

  if (!wordpressBaseUrl) {
    return null;
  }

  const { data } = await wordpressFetch<WordPressPost[]>("/wp/v2/posts", {
    query: {
      _embed: true,
      slug,
      status: "publish",
      per_page: 1,
    },
    tags: [`post:${slug}`, "posts"],
  });

  const post = data[0];

  return post ? mapPost(post) : null;
});

export async function getPostBySlug(slug: string) {
  return getPostBySlugCached(slug);
}

export async function getRelatedPosts(post: PostSummary, limit = 3) {
  const firstCategory = post.categories[0];

  if (!firstCategory) {
    return [];
  }

  const { items } = await getPosts({
    categoryId: firstCategory,
    perPage: limit + 1,
  });

  return items.filter((item) => item.id !== post.id).slice(0, limit);
}

const getCategoriesCached = cache(async () => {
  if (isSanityConfigured() && sanityClient) {
    try {
      const categories = await sanityFetch<
        (SanityCategoryDocument & { postCount: number })[]
      >(
        `*[_type == "category"] | order(title asc){
          _id,
          title,
          "slug": slug.current,
          description,
          "postCount": count(*[_type == "post" && references(^._id)])
        }`,
      );

      return categories.map(mapSanityCategory);
    } catch {
      return [];
    }
  }

  if (!wordpressBaseUrl) {
    return [];
  }

  const { data } = await wordpressFetch<WordPressCategory[]>("/wp/v2/categories", {
    query: {
      per_page: 100,
      hide_empty: true,
      orderby: "count",
      order: "desc",
    },
    tags: ["categories"],
  });

  return data.map(mapCategory);
});

export async function getCategories() {
  return getCategoriesCached();
}

const getCategoryBySlugCached = cache(async (slug: string) => {
  if (!slug) {
    return null;
  }

  if (isSanityConfigured() && sanityClient) {
    try {
      const category = await sanityFetch<
        (SanityCategoryDocument & { postCount: number }) | null
      >(
        `*[_type == "category" && slug.current == $slug][0]{
          _id,
          title,
          "slug": slug.current,
          description,
          "postCount": count(*[_type == "post" && references(^._id)])
        }`,
        { slug },
      );

      return category ? mapSanityCategory(category) : null;
    } catch {
      return null;
    }
  }

  if (!wordpressBaseUrl) {
    return null;
  }

  const { data } = await wordpressFetch<WordPressCategory[]>("/wp/v2/categories", {
    query: {
      slug,
      per_page: 1,
    },
    tags: ["categories"],
  });

  return data[0] ? mapCategory(data[0]) : null;
});

export async function getCategoryBySlug(slug?: string | null) {
  if (!slug) {
    return null;
  }

  return getCategoryBySlugCached(slug);
}

export async function getCategoryByPossibleSlugs(
  slugs: string[],
): Promise<CategorySummary | null> {
  const categories = await Promise.all(slugs.map((slug) => getCategoryBySlug(slug)));

  return categories.find(Boolean) ?? null;
}

const getTestimonialsCached = cache(async (limit: number): Promise<TestimonialEntry[]> => {
  if (isSanityConfigured() && sanityClient) {
    try {
      const testimonials = await sanityFetch<SanityTestimonialDocument[]>(
        `*[_type == "testimonial" && approved == true]
          | order(_createdAt desc)[0...$limit]{
            _id,
            name,
            "slug": coalesce(slug.current, _id),
            quote,
            rating,
            "image": photo{
              alt,
              asset->{
                url,
                metadata{
                  dimensions{
                    width,
                    height
                  }
                }
              }
            },
            seo{
              title,
              description,
              ogImage
            }
          }`,
        { limit },
      );

      return testimonials.map(mapSanityTestimonial);
    } catch {
      return [];
    }
  }

  if (!wordpressBaseUrl) {
    return [];
  }

  const { data } = await wordpressFetch<WordPressTestimonial[]>("/wp/v2/testimonial", {
    query: {
      _embed: true,
      per_page: limit,
      status: "publish",
      orderby: "date",
      order: "desc",
    },
    tags: ["testimonials"],
  });

  return data.map(mapTestimonial);
});

export async function getTestimonials(
  limit = TESTIMONIALS_PREVIEW_LIMIT,
): Promise<TestimonialEntry[]> {
  return getTestimonialsCached(limit);
}

const getFaqsCached = cache(async (): Promise<FaqEntry[]> => {
  if (isSanityConfigured() && sanityClient) {
    try {
      const faqs = await sanityFetch<SanityFaqDocument[]>(
        `*[_type == "faq"] | order(_createdAt asc){
          _id,
          question,
          "slug": coalesce(slug.current, _id),
          answer[]{
            ...,
            _type == "image" => {
              ...,
              "url": asset->url
            }
          }
        }`,
      );

      return faqs.map(mapSanityFaq);
    } catch {
      return [];
    }
  }

  if (!wordpressBaseUrl) {
    return [];
  }

  const { data } = await wordpressFetch<WordPressFaq[]>("/wp/v2/faq", {
    query: {
      _embed: true,
      per_page: 100,
      status: "publish",
      orderby: "menu_order",
      order: "asc",
    },
    tags: ["faqs"],
  });

  return data.map(mapFaq);
});

export async function getFaqs(): Promise<FaqEntry[]> {
  return getFaqsCached();
}

const getResourcesCached = cache(async (): Promise<ResourceEntry[]> => {
  if (isSanityConfigured() && sanityClient) {
    try {
      const resources = await sanityFetch<SanityResourceDocument[]>(
        `*[_type == "resource"] | order(highlight desc, _createdAt asc){
          ${resourceProjection}
        }`,
      );

      return resources.map(mapSanityResource);
    } catch {
      return [];
    }
  }

  if (!wordpressBaseUrl) {
    return [];
  }

  const { data } = await wordpressFetch<WordPressResource[]>("/wp/v2/resource", {
    query: {
      _embed: true,
      per_page: 100,
      status: "publish",
      orderby: "menu_order",
      order: "asc",
    },
    tags: ["resources"],
  });

  return data.map(mapResource);
});

export async function getResources(): Promise<ResourceEntry[]> {
  return getResourcesCached();
}

const getCommentsForPostCached = cache(
  async (postId: ContentId): Promise<CommentEntry[]> => {
    if (isSanityConfigured() && sanityClient && postId) {
      try {
        const comments = await sanityFetch<SanityCommentDocument[]>(
          `*[_type == "comment" && approved == true && post._ref == $postId]
            | order(coalesce(createdAt, _createdAt) asc){
              _id,
              name,
              email,
              message,
              approved,
              "createdAt": coalesce(createdAt, _createdAt),
              post->{
                _id
              },
              parentComment->{
                _id
              }
            }`,
          {
            postId: String(postId),
          },
        );

        const mappedComments = comments.map(mapSanityComment);
        const commentsById = new Map(
          mappedComments.map((comment) => [String(comment.id), comment]),
        );
        const roots: CommentEntry[] = [];

        for (const comment of mappedComments) {
          const parentId = comment.parentId ? String(comment.parentId) : null;

          if (parentId && commentsById.has(parentId)) {
            commentsById.get(parentId)?.replies?.push(comment);
            continue;
          }

          roots.push(comment);
        }

        return roots;
      } catch {
        return [];
      }
    }

    return [];
  },
);

export async function getCommentsForPost(postId: ContentId): Promise<CommentEntry[]> {
  return getCommentsForPostCached(postId);
}

export async function getIndexableContent() {
  const [posts, resources, aboutPage, contactPage, newsletterPage] = await Promise.all([
    getPosts({ page: 1, perPage: 100 }),
    getResources(),
    getPageBySlug("about"),
    getPageBySlug("contact"),
    getPageBySlug("newsletter"),
  ]);

  return {
    posts: posts.items,
    resources,
    pages: [aboutPage, contactPage, newsletterPage].filter(Boolean) as PageContent[],
  };
}
