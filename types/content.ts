export interface ImageAsset {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SeoFields {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface NavigationLink {
  id: number;
  title: string;
  url: string;
  target?: string;
}

export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified?: string;
  authorName?: string;
  categories: number[];
  image?: ImageAsset | null;
  seo: SeoFields;
  sticky: boolean;
  readingTime: number;
}

export interface CategorySummary {
  id: number;
  count: number;
  name: string;
  slug: string;
  description: string;
}

export interface PageContent {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image?: ImageAsset | null;
  seo: SeoFields;
}

export interface TestimonialEntry {
  id: number;
  slug: string;
  name: string;
  quote: string;
  rating: number;
  image?: ImageAsset | null;
  seo: SeoFields;
}

export interface ResourceEntry {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  ctaLabel?: string;
  ctaUrl?: string;
  highlight: boolean;
  image?: ImageAsset | null;
  seo: SeoFields;
}

export interface FaqEntry {
  id: number;
  slug: string;
  question: string;
  answer: string;
}
