import { cache } from "react";

import {
  DEFAULT_REVALIDATE,
  POSTS_PER_PAGE,
  TESTIMONIALS_PREVIEW_LIMIT,
} from "@/lib/constants";
import { decodeHtml, stripHtml } from "@/lib/utils";
import type {
  CategorySummary,
  FaqEntry,
  ImageAsset,
  PageContent,
  PostSummary,
  ResourceEntry,
  TestimonialEntry,
} from "@/types/content";
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
        "Connect your WordPress backend to manage this homepage hero, featured posts, and every section without touching the codebase.",
      primaryCtaLabel: "Read the journal",
      primaryCtaUrl: "/blog",
      secondaryCtaLabel: "About Mariam",
      secondaryCtaUrl: "/about",
    },
    newsletter: {
      eyebrow: "Stay close",
      title: "Letters worth slowing down for.",
      description:
        "Use the WordPress settings panel to tailor this invitation, then connect Beehiiv, ConvertKit, or Mailchimp when you are ready.",
      placeholder: "Enter your email address",
      buttonLabel: "Subscribe",
      disclaimer: "No spam. Just thoughtful updates, occasional recommendations, and new essays.",
    },
    contact: {
      email: "hello@example.com",
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

const getSiteSettingsCached = cache(async (): Promise<SiteSettings> => {
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

const getPageBySlugCached = cache(
  async (slug: string): Promise<PageContent | null> => {
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
  },
);

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
    categoryId: number,
    perPage: number,
  ): Promise<PaginatedResponse<PostSummary>> => {
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
}: {
  page?: number;
  search?: string;
  categoryId?: number;
  perPage?: number;
} = {}): Promise<PaginatedResponse<PostSummary>> {
  return getPostsCached(page, search ?? "", categoryId ?? 0, perPage);
}

export async function getLatestPosts(limit = 3, excludeId?: number) {
  const { items } = await getPosts({
    page: 1,
    perPage: Math.max(limit + (excludeId ? 1 : 0), limit),
  });

  return items.filter((item) => item.id !== excludeId).slice(0, limit);
}

export async function getStickyFeaturedPost() {
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
      },
      tags: ["posts", "featured-post"],
    });

    if (data[0]) {
      return mapPost(data[0]);
    }
  } catch {
    return null;
  }

  const latest = await getLatestPosts(1);
  return latest[0] ?? null;
}

const getPostBySlugCached = cache(async (slug: string) => {
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
  const { items } = await getPosts({
    categoryId: firstCategory,
    perPage: limit + 1,
  });

  return items.filter((item) => item.id !== post.id).slice(0, limit);
}

const getCategoriesCached = cache(async () => {
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
  if (!slug || !wordpressBaseUrl) {
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

const getTestimonialsCached = cache(
  async (limit: number): Promise<TestimonialEntry[]> => {
    if (!wordpressBaseUrl) {
      return [];
    }

    const { data } = await wordpressFetch<WordPressTestimonial[]>(
      "/wp/v2/testimonial",
      {
        query: {
          _embed: true,
          per_page: limit,
          status: "publish",
          orderby: "date",
          order: "desc",
        },
        tags: ["testimonials"],
      },
    );

    return data.map(mapTestimonial);
  },
);

export async function getTestimonials(
  limit = TESTIMONIALS_PREVIEW_LIMIT,
): Promise<TestimonialEntry[]> {
  return getTestimonialsCached(limit);
}

const getFaqsCached = cache(async (): Promise<FaqEntry[]> => {
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

export async function getIndexableContent() {
  const [posts, resources, aboutPage, contactPage, newsletterPage] =
    await Promise.all([
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
