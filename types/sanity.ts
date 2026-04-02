export interface SanityImageField {
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
}

export interface SanityFileField {
  asset?: {
    url?: string;
    originalFilename?: string;
    mimeType?: string;
  };
}

export interface SanityMarkDefinition {
  _key: string;
  _type: string;
  href?: string;
}

export interface SanitySpanNode {
  _key?: string;
  _type: "span";
  marks?: string[];
  text?: string;
}

export interface SanityBlockNode {
  _key?: string;
  _type: "block";
  style?: string;
  children?: SanitySpanNode[];
  markDefs?: SanityMarkDefinition[];
  listItem?: "bullet" | "number";
  level?: number;
}

export interface SanityImageBlockNode {
  _key?: string;
  _type: "image";
  url?: string;
  alt?: string;
  caption?: string;
}

export type SanityPortableNode = SanityBlockNode | SanityImageBlockNode;

export interface SanitySeoField {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface SanityCategoryDocument {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

export interface SanityPageDocument {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: SanityPortableNode[];
  featuredImage?: SanityImageField | null;
  seo?: SanitySeoField;
}

export interface SanityPostDocument {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: SanityPortableNode[];
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  categories?: SanityCategoryDocument[];
  featuredImage?: SanityImageField | null;
  seo?: SanitySeoField;
  featuredOnHome?: boolean;
  commentCount?: number;
  likeCount?: number;
}

export interface SanityTestimonialDocument {
  _id: string;
  name: string;
  slug: string;
  quote?: string;
  rating?: number;
  image?: SanityImageField | null;
  seo?: SanitySeoField;
  approved?: boolean;
}

export interface SanityNewsletterSubscriberDocument {
  _id: string;
  email: string;
  subscribedAt?: string;
  source?: string;
}

export interface SanityCommentDocument {
  _id: string;
  name: string;
  email?: string;
  message?: string;
  approved?: boolean;
  createdAt?: string;
  post?: {
    _id: string;
  };
  parentComment?: {
    _id: string;
  };
}

export interface SanityContactMessageDocument {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  reviewed?: boolean;
  createdAt?: string;
  source?: string;
}

export interface SanityFaqDocument {
  _id: string;
  question: string;
  slug: string;
  answer?: SanityPortableNode[];
}

export interface SanityResourceDocument {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: SanityPortableNode[];
  ctaLabel?: string;
  ctaUrl?: string;
  highlight?: boolean;
  featuredImage?: SanityImageField | null;
  seo?: SanitySeoField;
}

export interface SanityMenuItem {
  _key?: string;
  title: string;
  url: string;
  target?: string;
}

export interface SanitySocialLink {
  _key?: string;
  label: string;
  url: string;
}

export interface SanitySiteSettingsDocument {
  siteTitle?: string;
  siteDescription?: string;
  siteUrl?: string;
  logo?: SanityImageField | null;
  logoAlt?: string;
  header?: {
    eyebrow?: string;
    monogram?: string;
    subscribeLabel?: string;
    mobileLabel?: string;
  };
  profile?: {
    eyebrow?: string;
    title?: string;
    summary?: string;
    highlights?: string[];
    quickLinks?: SanityMenuItem[];
    primaryLinkLabel?: string;
    primaryLinkUrl?: string;
    resume?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      fileButtonLabel?: string;
      downloadButtonLabel?: string;
      linkedInLabel?: string;
      linkedInUrl?: string;
      cvFile?: SanityFileField | null;
    };
  };
  primaryMenu?: SanityMenuItem[];
  footerMenu?: SanityMenuItem[];
  hero?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    primaryCtaLabel?: string;
    primaryCtaUrl?: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
  };
  home?: {
    featured?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      label?: string;
    };
    letters?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      latestLabel?: string;
      primaryCtaLabel?: string;
      secondaryCtaLabel?: string;
    };
    notes?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      archiveLabel?: string;
      profileCardEyebrow?: string;
      profileCtaLabel?: string;
      browseEyebrow?: string;
    };
    testimonials?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      ctaLabel?: string;
    };
    social?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      emailLabel?: string;
    };
  };
  pageCopy?: {
    blog?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      emptyTitle?: string;
      emptyDescription?: string;
    };
    about?: {
      eyebrow?: string;
      faqEyebrow?: string;
      faqTitle?: string;
      faqDescription?: string;
      testimonialsEyebrow?: string;
      testimonialsTitle?: string;
      testimonialsDescription?: string;
    };
    resources?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      emptyTitle?: string;
      emptyDescription?: string;
    };
    contact?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      emailLabel?: string;
      locationLabel?: string;
      availabilityLabel?: string;
    };
    reviews?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      emptyTitle?: string;
      emptyDescription?: string;
    };
    letters?: {
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
    newsletterPage?: {
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
  };
  newsletter?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    placeholder?: string;
    buttonLabel?: string;
    disclaimer?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    availability?: string;
  };
  socialLinks?: SanitySocialLink[];
  footer?: {
    blurb?: string;
    copyright?: string;
    newsletterCtaLabel?: string;
    newsletterCtaUrl?: string;
  };
}
