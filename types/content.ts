export type ContentId = string | number;

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
  id: ContentId;
  title: string;
  url: string;
  target?: string;
}

export interface PostSummary {
  id: ContentId;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified?: string;
  authorName?: string;
  categories: ContentId[];
  image?: ImageAsset | null;
  seo: SeoFields;
  sticky: boolean;
  readingTime: number;
  commentCount?: number;
  likeCount?: number;
}

export interface CategorySummary {
  id: ContentId;
  count: number;
  name: string;
  slug: string;
  description: string;
}

export interface PageContent {
  id: ContentId;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image?: ImageAsset | null;
  seo: SeoFields;
}

export interface TestimonialEntry {
  id: ContentId;
  slug: string;
  name: string;
  quote: string;
  rating: number;
  image?: ImageAsset | null;
  seo: SeoFields;
}

export interface ResourceEntry {
  id: ContentId;
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
  id: ContentId;
  slug: string;
  question: string;
  answer: string;
}

export interface CommentEntry {
  id: ContentId;
  postId: ContentId;
  parentId?: ContentId;
  name: string;
  message: string;
  date: string;
  approved: boolean;
  likeCount?: number;
  replies?: CommentEntry[];
}
