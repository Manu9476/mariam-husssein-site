# Managing Content Without Code

## What You Edit In WordPress

Use these areas of WordPress Admin:

- `Mariam Brand` for hero copy, newsletter text, contact details, social links, and footer copy
- `Pages` for About, Contact, Newsletter, Reviews, Privacy Policy, and Terms
- `Posts` for blog articles
- `Categories` and `Tags` for post organization
- `Resources` for services, offers, free downloads, or curated recommendations
- `FAQs` for common questions
- `Testimonials` for approved reviews and public submissions
- `Contact Messages` for incoming contact form submissions
- `Appearance -> Menus` for navigation labels and links
- `Appearance -> Customize -> Site Identity` for the logo, site title, and tagline

## How To Change The Homepage

Homepage sections come from WordPress like this:

- hero section: `Mariam Brand`
- featured article: make a blog post `Sticky`
- latest posts: publish regular blog posts
- about preview: edit the `About` page content and featured image
- testimonials preview: publish testimonials
- newsletter section: `Mariam Brand`
- social links: `Mariam Brand`
- footer copy: `Mariam Brand`

## How To Manage The Letters Pages

The three editorial letter pages are:

- `/letters/younger-me`
- `/letters/current-me`
- `/letters/future-me`

Each one is powered by a WordPress category plus an optional WordPress page for intro copy and SEO.

Create these categories in `Posts -> Categories`:

- `younger-me`
- `current-me`
- `future-me`

Assign posts to those categories and they will automatically appear in the matching letters page.
Featured images for those posts are optional, and inline photos inside the post body are supported too.

If you want editable intro copy, featured image, and SEO for each page, create these WordPress pages:

- `letters-younger-me`
- `letters-current-me`
- `letters-future-me`

Use the page title, excerpt, featured image, and SEO fields to control the top section of each letters page.

## How To Add A Blog Post

1. Go to `Posts -> Add New`.
2. Add a title, featured image, excerpt, categories, and content.
3. Fill the `Headless SEO` box if you want custom metadata.
4. Publish the post.
5. If you want it featured on the homepage, mark it as `Sticky`.

You can also add optional inline photos inside the WordPress editor for stories and letters.
Those images will render inside the article body on the frontend.

## How To Add A Resource Or Service

1. Go to `Resources -> Add New`.
2. Add the title, excerpt, body content, and featured image.
3. Fill the `Resource Details` box with CTA label and URL.
4. Use the highlight checkbox if you want the card to stand out.
5. Publish.

## How To Moderate Reviews

Public reviews submitted from the frontend appear in:

- `Testimonials`

Workflow:

1. Open a pending testimonial.
2. Review the message, submitter details, rating, and photo.
3. Publish it to approve.
4. Trash it to reject.

Only published testimonials are shown on the public website.

## How To View Contact Form Messages

Every contact form submission is stored in:

- `Contact Messages`

Open any message to read the full contents.
