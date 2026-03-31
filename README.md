# Mariam Husssein Personal Brand Website

A production-ready Next.js 15 App Router frontend for a soft editorial personal brand site, powered by WordPress on cPanel as the headless CMS.

## Folder Structure

```text
.
|-- app
|   |-- api
|   |-- about
|   |-- blog
|   |-- contact
|   |-- newsletter
|   |-- privacy-policy
|   |-- resources
|   |-- reviews
|   |-- terms
|   |-- globals.css
|   |-- layout.tsx
|   |-- page.tsx
|   |-- robots.ts
|   `-- sitemap.ts
|-- components
|   |-- content
|   |-- forms
|   |-- layout
|   |-- sections
|   |-- shared
|   `-- ui
|-- docs
|   |-- content-management.md
|   |-- seo-checklist.md
|   |-- vercel-deployment.md
|   `-- wordpress-setup.md
|-- lib
|   |-- api
|   |-- forms
|   |-- constants.ts
|   |-- seo.ts
|   |-- utils.ts
|   `-- validators.ts
|-- public
|   `-- og-image.svg
|-- types
|-- wordpress
|   `-- mh-brand-cms
|       `-- mh-brand-cms.php
`-- .env.example
```

## Code By Area

- `app/`: App Router pages, metadata, route handlers, sitemap, and robots.
- `components/ui/`: shadcn-style reusable primitives.
- `components/content/`: editorial cards, search, categories, and pagination.
- `components/forms/`: contact, newsletter, and testimonial submission UI.
- `components/sections/`: homepage and marketing sections.
- `lib/api/wordpress.ts`: the typed WordPress REST layer and CMS mappers.
- `wordpress/mh-brand-cms/`: the WordPress plugin that adds settings, custom post types, REST endpoints, moderation flow, and backend helpers.

## Getting Started

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_WORDPRESS_URL` to your live WordPress install on cPanel.
3. Install dependencies with `npm install`.
4. Run the frontend locally with `npm run dev`.
5. Upload the WordPress plugin from [`wordpress/mh-brand-cms/mh-brand-cms.php`](/c:/Users/EMMANUEL/OneDrive/Desktop/Mariam%20Hussein%20Personal%20Blog/wordpress/mh-brand-cms/mh-brand-cms.php) to your WordPress site and activate it.

## Setup Guides

- WordPress on cPanel: [`docs/wordpress-setup.md`](/c:/Users/EMMANUEL/OneDrive/Desktop/Mariam%20Hussein%20Personal%20Blog/docs/wordpress-setup.md)
- Vercel deployment: [`docs/vercel-deployment.md`](/c:/Users/EMMANUEL/OneDrive/Desktop/Mariam%20Hussein%20Personal%20Blog/docs/vercel-deployment.md)
- Managing content without code: [`docs/content-management.md`](/c:/Users/EMMANUEL/OneDrive/Desktop/Mariam%20Hussein%20Personal%20Blog/docs/content-management.md)
- SEO checklist: [`docs/seo-checklist.md`](/c:/Users/EMMANUEL/OneDrive/Desktop/Mariam%20Hussein%20Personal%20Blog/docs/seo-checklist.md)

## Suggested Improvements

- Add on-demand ISR with a WordPress webhook so content refreshes instantly after publishing.
- Add preview mode for draft posts and pages.
- Connect a real newsletter provider endpoint instead of placeholder mode.
- Add an analytics layer such as Vercel Web Analytics and event tracking for form conversions.
- Add rich author bios, downloadable lead magnets, and resource taxonomy filters as the content grows.
