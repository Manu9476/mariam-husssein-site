import type { ContentId } from "@/types/content";

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
  id: ContentId;
  title: string;
  url: string;
  target?: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface EditableLink {
  title: string;
  url: string;
  target?: string;
}

export interface EditableDocument {
  url: string;
  filename?: string;
  mimeType?: string;
}

export interface HeaderSettings {
  eyebrow?: string;
  monogram?: string;
  subscribeLabel?: string;
  mobileLabel?: string;
}

export interface ProfileSettings {
  eyebrow?: string;
  title?: string;
  summary?: string;
  highlights: string[];
  quickLinks: EditableLink[];
  primaryLinkLabel?: string;
  primaryLinkUrl?: string;
  resume: {
    eyebrow?: string;
    title?: string;
    description?: string;
    fileButtonLabel?: string;
    downloadButtonLabel?: string;
    linkedInLabel?: string;
    linkedInUrl?: string;
    cvFile?: EditableDocument | null;
  };
}

export interface HomeSectionCopy {
  featured: {
    eyebrow?: string;
    title: string;
    description?: string;
    label?: string;
  };
  letters: {
    eyebrow?: string;
    title: string;
    description?: string;
    latestLabel?: string;
    primaryCtaLabel?: string;
    secondaryCtaLabel?: string;
  };
  notes: {
    eyebrow?: string;
    title: string;
    description?: string;
    archiveLabel?: string;
    profileCardEyebrow?: string;
    profileCtaLabel?: string;
    browseEyebrow?: string;
  };
  testimonials: {
    eyebrow?: string;
    title: string;
    description?: string;
    ctaLabel?: string;
  };
  social: {
    eyebrow?: string;
    title: string;
    description?: string;
    emailLabel?: string;
  };
}

export interface PageSectionCopy {
  blog: {
    eyebrow?: string;
    title: string;
    description?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  };
  about: {
    eyebrow?: string;
    faqEyebrow?: string;
    faqTitle?: string;
    faqDescription?: string;
    testimonialsEyebrow?: string;
    testimonialsTitle?: string;
    testimonialsDescription?: string;
  };
  resources: {
    eyebrow?: string;
    title?: string;
    description?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  };
  contact: {
    eyebrow?: string;
    title?: string;
    description?: string;
    emailLabel?: string;
    locationLabel?: string;
    availabilityLabel?: string;
  };
  reviews: {
    eyebrow?: string;
    title?: string;
    description?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  };
  letters: {
    featuredLabel?: string;
    popularTitle?: string;
    popularArchiveLabel?: string;
    recentEyebrow?: string;
    recentTitle?: string;
    recentArchiveLabel?: string;
    profileEyebrow?: string;
    newsletterEyebrow?: string;
    readNextEyebrow?: string;
    socialEyebrow?: string;
  };
  newsletterPage: {
    eyebrow?: string;
    title?: string;
    description?: string;
    subscribedEyebrow?: string;
    subscribedTitle?: string;
    subscribedDescription?: string;
    previewEyebrow?: string;
    previewTitle?: string;
    previewDescription?: string;
  };
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
  header: HeaderSettings;
  profile: ProfileSettings;
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
  home: HomeSectionCopy;
  pageCopy: PageSectionCopy;
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
