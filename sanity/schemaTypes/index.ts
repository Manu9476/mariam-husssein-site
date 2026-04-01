import { defineArrayMember, defineField, defineType } from "sanity";

const richTextField = defineField({
  name: "body",
  title: "Body content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [{ title: "Bullet", value: "bullet" }, { title: "Numbered", value: "number" }],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" },
          { title: "Underline", value: "underline" },
        ],
        annotations: [
          {
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],
    }),
  ],
});

const seoField = defineField({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", title: "SEO title", type: "string" }),
    defineField({
      name: "description",
      title: "SEO description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "Open Graph image URL",
      type: "url",
    }),
  ],
});

const imageField = defineField({
  name: "featuredImage",
  title: "Featured image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      validation: (rule) => rule.max(160),
    }),
  ],
});

const page = defineType({
  name: "page",
  title: "Pages",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "excerpt", title: "Short intro", type: "text", rows: 4 }),
    imageField,
    richTextField,
    seoField,
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "featuredImage",
    },
  },
});

const author = defineType({
  name: "author",
  title: "Authors",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Profile image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
  ],
});

const category = defineType({
  name: "category",
  title: "Categories",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
  ],
});

const post = defineType({
  name: "post",
  title: "Posts",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 4 }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
    }),
    defineField({
      name: "featuredOnHome",
      title: "Feature on homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "likeCount",
      title: "Public likes",
      type: "number",
      initialValue: 0,
      description: "Updated automatically when readers like this post.",
    }),
    imageField,
    richTextField,
    seoField,
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "featuredImage",
    },
  },
});

const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Stored for moderation only.",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (rule) => rule.min(1).max(5).required(),
      initialValue: 5,
    }),
    defineField({
      name: "approved",
      title: "Approved for public display",
      type: "boolean",
      initialValue: false,
      description: "Turn this on when you want a testimonial to appear on the public site.",
    }),
    defineField({ name: "quote", title: "Quote", type: "text", rows: 5, validation: (rule) => rule.required() }),
    defineField({
      name: "photo",
      title: "Optional photo",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
    seoField,
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "approved",
      media: "photo",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? "Approved" : "Pending approval",
        media,
      };
    },
  },
});

const newsletterSubscriber = defineType({
  name: "newsletterSubscriber",
  title: "Subscribers",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "subscribedAt",
      title: "Subscribed at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      initialValue: "website",
    }),
  ],
  preview: {
    select: {
      title: "email",
      subtitle: "subscribedAt",
    },
  },
});

const comment = defineType({
  name: "comment",
  title: "Comments",
  type: "document",
  fields: [
    defineField({
      name: "post",
      title: "Post",
      type: "reference",
      to: [{ type: "post" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Stored for moderation only.",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "message",
      title: "Comment",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parentComment",
      title: "Reply to",
      type: "reference",
      to: [{ type: "comment" }],
      description: "Leave empty for a top-level comment.",
    }),
    defineField({
      name: "approved",
      title: "Approved for public display",
      type: "boolean",
      initialValue: true,
      description: "Turn this off if you want to hide a comment from the public site.",
    }),
    defineField({
      name: "createdAt",
      title: "Submitted at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "post.title",
      replyTo: "parentComment.name",
    },
    prepare({ title, subtitle, replyTo }) {
      return {
        title,
        subtitle: replyTo
          ? `Reply to ${replyTo}${subtitle ? ` on ${subtitle}` : ""}`
          : subtitle
            ? `On ${subtitle}`
            : "Pending post reference",
      };
    },
  },
});

const contactMessage = defineType({
  name: "contactMessage",
  title: "Contact Messages",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "subject",
      title: "Subject",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 8,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "reviewed",
      title: "Reviewed",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Submitted at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      initialValue: "website",
    }),
  ],
  preview: {
    select: {
      title: "subject",
      subtitle: "name",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Untitled message",
        subtitle: subtitle ? `From ${subtitle}` : "Website contact form",
      };
    },
  },
});

const faq = defineType({
  name: "faq",
  title: "FAQs",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "question", maxLength: 96 },
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      validation: (rule) => rule.required(),
    }),
  ],
});

const resource = defineType({
  name: "resource",
  title: "Resources",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 4 }),
    defineField({ name: "ctaLabel", title: "CTA label", type: "string", initialValue: "Learn more" }),
    defineField({ name: "ctaUrl", title: "CTA URL", type: "url" }),
    defineField({ name: "highlight", title: "Highlight on page", type: "boolean", initialValue: false }),
    imageField,
    richTextField,
    seoField,
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "ctaLabel",
      media: "featuredImage",
    },
  },
});

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", title: "Site title", type: "string" }),
    defineField({ name: "siteDescription", title: "Site description", type: "text", rows: 3 }),
    defineField({ name: "siteUrl", title: "Public site URL", type: "url" }),
    defineField({
      name: "logo",
      title: "Logo / profile image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
    defineField({ name: "logoAlt", title: "Logo alt text", type: "string" }),
    defineField({
      name: "header",
      title: "Header",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Brand eyebrow", type: "string" }),
        defineField({ name: "monogram", title: "Monogram", type: "string" }),
        defineField({ name: "subscribeLabel", title: "Subscribe button label", type: "string" }),
        defineField({ name: "mobileLabel", title: "Mobile helper label", type: "string" }),
      ],
    }),
    defineField({
      name: "profile",
      title: "Profile narrative",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Profile title", type: "string" }),
        defineField({ name: "summary", title: "Summary", type: "text", rows: 4 }),
        defineField({
          name: "highlights",
          title: "Highlights",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
        }),
        defineField({
          name: "quickLinks",
          title: "Quick links",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "title", title: "Label", type: "string", validation: (rule) => rule.required() }),
                defineField({ name: "url", title: "URL", type: "string", validation: (rule) => rule.required() }),
                defineField({ name: "target", title: "Target", type: "string" }),
              ],
            }),
          ],
        }),
        defineField({ name: "primaryLinkLabel", title: "Profile CTA label", type: "string" }),
        defineField({ name: "primaryLinkUrl", title: "Profile CTA URL", type: "string" }),
      ],
    }),
    defineField({
      name: "primaryMenu",
      title: "Primary menu",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Label", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "url", title: "URL", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "target", title: "Target", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "footerMenu",
      title: "Footer menu",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Label", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "url", title: "URL", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "target", title: "Target", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "hero",
      title: "Homepage hero",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "subtitle", title: "Subtitle", type: "text", rows: 4 }),
        defineField({ name: "primaryCtaLabel", title: "Primary CTA label", type: "string" }),
        defineField({ name: "primaryCtaUrl", title: "Primary CTA URL", type: "string" }),
        defineField({ name: "secondaryCtaLabel", title: "Secondary CTA label", type: "string" }),
        defineField({ name: "secondaryCtaUrl", title: "Secondary CTA URL", type: "string" }),
      ],
    }),
    defineField({
      name: "home",
      title: "Homepage section copy",
      type: "object",
      fields: [
        defineField({
          name: "featured",
          title: "Featured section",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "label", title: "Card label", type: "string" }),
          ],
        }),
        defineField({
          name: "letters",
          title: "Letters section",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "latestLabel", title: "Latest-post label", type: "string" }),
            defineField({ name: "primaryCtaLabel", title: "Primary CTA label", type: "string" }),
            defineField({ name: "secondaryCtaLabel", title: "Secondary CTA label", type: "string" }),
          ],
        }),
        defineField({
          name: "notes",
          title: "Notes section",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "archiveLabel", title: "Archive link label", type: "string" }),
            defineField({ name: "profileCardEyebrow", title: "Profile card eyebrow", type: "string" }),
            defineField({ name: "profileCtaLabel", title: "Profile CTA label", type: "string" }),
            defineField({ name: "browseEyebrow", title: "Browse card eyebrow", type: "string" }),
          ],
        }),
        defineField({
          name: "testimonials",
          title: "Testimonials section",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "ctaLabel", title: "CTA label", type: "string" }),
          ],
        }),
        defineField({
          name: "social",
          title: "Social section",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "emailLabel", title: "Email label", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "pageCopy",
      title: "Page section copy",
      type: "object",
      fields: [
        defineField({
          name: "blog",
          title: "Notes page",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "emptyTitle", title: "Empty-state title", type: "string" }),
            defineField({ name: "emptyDescription", title: "Empty-state description", type: "text", rows: 3 }),
          ],
        }),
        defineField({
          name: "about",
          title: "About page",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "faqEyebrow", title: "FAQ eyebrow", type: "string" }),
            defineField({ name: "faqTitle", title: "FAQ title", type: "string" }),
            defineField({ name: "faqDescription", title: "FAQ description", type: "text", rows: 3 }),
            defineField({ name: "testimonialsEyebrow", title: "Testimonials eyebrow", type: "string" }),
            defineField({ name: "testimonialsTitle", title: "Testimonials title", type: "string" }),
            defineField({ name: "testimonialsDescription", title: "Testimonials description", type: "text", rows: 3 }),
          ],
        }),
        defineField({
          name: "resources",
          title: "Resources page",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "emptyTitle", title: "Empty-state title", type: "string" }),
            defineField({ name: "emptyDescription", title: "Empty-state description", type: "text", rows: 3 }),
          ],
        }),
        defineField({
          name: "contact",
          title: "Contact page",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "emailLabel", title: "Email label", type: "string" }),
            defineField({ name: "locationLabel", title: "Location label", type: "string" }),
            defineField({ name: "availabilityLabel", title: "Availability label", type: "string" }),
          ],
        }),
        defineField({
          name: "reviews",
          title: "Reviews page",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "emptyTitle", title: "Empty-state title", type: "string" }),
            defineField({ name: "emptyDescription", title: "Empty-state description", type: "text", rows: 3 }),
          ],
        }),
        defineField({
          name: "letters",
          title: "Letters pages",
          type: "object",
          fields: [
            defineField({ name: "featuredLabel", title: "Featured label", type: "string" }),
            defineField({ name: "popularTitle", title: "Popular-strip title", type: "string" }),
            defineField({ name: "popularArchiveLabel", title: "Popular-strip link label", type: "string" }),
            defineField({ name: "recentEyebrow", title: "Recent section eyebrow", type: "string" }),
            defineField({ name: "recentTitle", title: "Recent section title", type: "string" }),
            defineField({ name: "recentArchiveLabel", title: "Recent section link label", type: "string" }),
            defineField({ name: "profileEyebrow", title: "Profile card eyebrow", type: "string" }),
            defineField({ name: "newsletterEyebrow", title: "Newsletter card eyebrow", type: "string" }),
            defineField({ name: "readNextEyebrow", title: "Read-next eyebrow", type: "string" }),
            defineField({ name: "socialEyebrow", title: "Social card eyebrow", type: "string" }),
          ],
        }),
        defineField({
          name: "newsletterPage",
          title: "Newsletter page",
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Default eyebrow", type: "string" }),
            defineField({ name: "title", title: "Default title", type: "string" }),
            defineField({ name: "description", title: "Default description", type: "text", rows: 3 }),
            defineField({ name: "subscribedEyebrow", title: "Subscribed eyebrow", type: "string" }),
            defineField({ name: "subscribedTitle", title: "Subscribed title", type: "string" }),
            defineField({ name: "subscribedDescription", title: "Subscribed description", type: "text", rows: 3 }),
            defineField({ name: "previewEyebrow", title: "Preview eyebrow", type: "string" }),
            defineField({ name: "previewTitle", title: "Preview title", type: "string" }),
            defineField({ name: "previewDescription", title: "Preview description", type: "text", rows: 3 }),
          ],
        }),
      ],
    }),
    defineField({
      name: "newsletter",
      title: "Newsletter section",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
        defineField({ name: "placeholder", title: "Email placeholder", type: "string" }),
        defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
        defineField({ name: "disclaimer", title: "Disclaimer", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "contact",
      title: "Contact details",
      type: "object",
      fields: [
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          description:
            "This controls the fallback email shown on the website and receives form notifications when email delivery is configured.",
        }),
        defineField({ name: "phone", title: "Phone", type: "string" }),
        defineField({ name: "location", title: "Location", type: "string" }),
        defineField({ name: "availability", title: "Availability note", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      description: "Update your website and social media handles here.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "url", title: "URL", type: "url", validation: (rule) => rule.required() }),
          ],
        }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        defineField({ name: "blurb", title: "Blurb", type: "text", rows: 3 }),
        defineField({ name: "copyright", title: "Copyright line", type: "string" }),
        defineField({ name: "newsletterCtaLabel", title: "Newsletter CTA label", type: "string" }),
        defineField({ name: "newsletterCtaUrl", title: "Newsletter CTA URL", type: "string" }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
        subtitle: "Global content and navigation",
      };
    },
  },
});

export const schemaTypes = [
  siteSettings,
  page,
  author,
  category,
  post,
  testimonial,
  newsletterSubscriber,
  comment,
  contactMessage,
  faq,
  resource,
];
