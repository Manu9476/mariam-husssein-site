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
        defineField({ name: "email", title: "Email", type: "string" }),
        defineField({ name: "phone", title: "Phone", type: "string" }),
        defineField({ name: "location", title: "Location", type: "string" }),
        defineField({ name: "availability", title: "Availability note", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
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
  faq,
  resource,
];
