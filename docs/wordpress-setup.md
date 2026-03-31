# WordPress Setup On cPanel

## 1. Install WordPress

1. Create a MySQL database and user in cPanel.
2. Install WordPress in your preferred subdomain or domain, for example `cms.yourdomain.com`.
3. Log in to WordPress Admin.
4. Go to `Settings -> Permalinks` and choose `Post name`.

## 2. Install The MH Brand CMS Plugin

1. Open the plugin file at [`wordpress/mh-brand-cms/mh-brand-cms.php`](/c:/Users/EMMANUEL/OneDrive/Desktop/Mariam%20Hussein%20Personal%20Blog/wordpress/mh-brand-cms/mh-brand-cms.php).
2. Zip the `mh-brand-cms` folder.
3. In WordPress Admin go to `Plugins -> Add New -> Upload Plugin`.
4. Upload the zip and activate it.

The plugin will:

- create custom post types for `Testimonials`, `FAQs`, `Resources`, and `Contact Messages`
- create starter pages for `About`, `Contact`, `Newsletter`, `Reviews`, `Resources`, `Privacy Policy`, and `Terms`
- add a `Mariam Brand` admin page for hero, newsletter, contact, social, and footer settings
- expose a headless settings REST endpoint for the Next.js frontend
- accept public testimonial submissions and save them as pending testimonials
- save contact form submissions into WordPress

## 3. Configure Global Brand Settings

Go to `WordPress Admin -> Mariam Brand`.

Update:

- hero eyebrow, title, subtitle, and CTA links
- newsletter heading, description, placeholder, button text, and disclaimer
- contact email, phone, location, and availability copy
- social links
- footer blurb and footer newsletter CTA

## 4. Configure Site Identity And Menus

Go to `Appearance -> Customize -> Site Identity`.

Update:

- site title
- tagline
- custom logo

Go to `Appearance -> Menus`.

Create and assign:

- `Primary Navigation`
- `Footer Navigation`

## 5. Create And Edit Content

Use native WordPress content for:

- `Pages` for About, Contact, Newsletter, Reviews, Privacy Policy, and Terms
- `Posts` for Journal / Blog content
- `Categories` and `Tags` for blog organization

Use plugin content types for:

- `Testimonials`
- `FAQs`
- `Resources`
- `Contact Messages`

## 6. SEO Fields

Each post, page, and resource includes a `Headless SEO` meta box.

Use it to set:

- SEO title
- SEO description
- Open Graph image URL

## 7. Review Submission Workflow

Public visitors submit a review from the Next.js site.

Those submissions are saved in:

- `WordPress Admin -> Testimonials`

Every new review is created with `Pending Review` status.

To approve a review:

1. Open the testimonial.
2. Check the name, email, rating, message, and optional photo.
3. Change the status to `Published`.
4. Save or publish the post.

Only published testimonials appear on the public site.

To reject a review:

- move it to trash, or
- leave it pending and never publish it

If you want to inspect the raw records directly, they are stored in the WordPress MySQL database and can be viewed in `cPanel -> phpMyAdmin`.

## 8. Contact Form Storage

Contact form submissions are saved in:

- `WordPress Admin -> Contact Messages`

This gives you a simple inbox inside WordPress even before you connect a dedicated email or CRM workflow.

## 9. REST API Health Check

Before deploying the frontend, confirm these endpoints work:

- `https://your-wordpress-site.com/wp-json/mh-site/v1/settings`
- `https://your-wordpress-site.com/wp-json/wp/v2/posts`
- `https://your-wordpress-site.com/wp-json/wp/v2/testimonial`
- `https://your-wordpress-site.com/wp-json/wp/v2/resource`
- `https://your-wordpress-site.com/wp-json/wp/v2/faq`
