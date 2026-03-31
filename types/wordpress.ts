export interface WordPressRenderedField {
  rendered: string;
}

export interface WordPressEmbeddedImage {
  source_url: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<
      string,
      {
        source_url: string;
        width?: number;
        height?: number;
      }
    >;
  };
}

export interface WordPressEmbeddedAuthor {
  name: string;
}

export interface SeoMetaFields {
  _mh_seo_title?: string;
  _mh_seo_description?: string;
  _mh_og_image?: string;
  _mh_featured_on_home?: boolean;
  _mh_resource_url?: string;
  _mh_resource_cta_label?: string;
  _mh_resource_highlight?: boolean;
  _mh_testimonial_rating?: number;
  _mh_submitter_name?: string;
}

export interface WordPressBaseNode {
  id: number;
  slug: string;
  date?: string;
  modified?: string;
  link?: string;
  status?: string;
  title: WordPressRenderedField;
  content?: WordPressRenderedField;
  excerpt?: WordPressRenderedField;
  featured_media?: number;
  meta?: SeoMetaFields;
  _embedded?: {
    "wp:featuredmedia"?: WordPressEmbeddedImage[];
    author?: WordPressEmbeddedAuthor[];
  };
}

export interface WordPressPage extends WordPressBaseNode {}

export interface WordPressPost extends WordPressBaseNode {
  sticky?: boolean;
  categories?: number[];
  tags?: number[];
}

export interface WordPressCategory {
  id: number;
  count: number;
  name: string;
  slug: string;
  description: string;
}

export interface NavigationItem {
  id: number;
  title: string;
  url: string;
  target?: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
  primaryMenu: NavigationItem[];
  footerMenu: NavigationItem[];
  hero: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaUrl: string;
    secondaryCtaLabel: string;
    secondaryCtaUrl: string;
  };
  newsletter: {
    eyebrow?: string;
    title: string;
    description: string;
    placeholder: string;
    buttonLabel: string;
    disclaimer?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    availability?: string;
  };
  socialLinks: SocialLink[];
  footer: {
    blurb?: string;
    copyright?: string;
    newsletterCtaLabel?: string;
    newsletterCtaUrl?: string;
  };
}

export interface WordPressFaq extends WordPressBaseNode {}

export interface WordPressResource extends WordPressBaseNode {}

export interface WordPressTestimonial extends WordPressBaseNode {}

export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  totalItems: number;
}
