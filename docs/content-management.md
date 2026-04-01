# Managing Content In Sanity Studio

Open your content dashboard at:

- `/studio` on localhost while developing
- `/studio` on your live Vercel site after deployment

## What You Edit In Studio

Use these collections in Sanity Studio:

- `Site Settings` for hero copy, fallback email, social links, menus, newsletter text, and footer content
- `Pages` for About, Contact, Newsletter, Privacy Policy, and Terms
- `Posts` for notes, stories, and letters
- `Categories` for grouping posts like `Younger Me`, `Current Me`, and `Future Me`
- `Resources` for services, offers, curated tools, and downloads
- `Testimonials` for public reviews
- `Subscribers` for newsletter signups from the website
- `Comments` for post comments and replies awaiting approval
- `Contact Messages` for everything sent through the contact form
- `Reports` for CSV exports of subscribers and comments by custom date range
- `FAQs` for common questions and answers

## How To Change The Homepage

Homepage sections come from Studio like this:

- hero section: `Site Settings -> Homepage hero`
- featured article: mark a post with `Feature on homepage`
- latest posts: publish regular posts
- about preview: edit the `About` page content and featured image
- testimonials preview: approve testimonials
- newsletter section: `Site Settings -> Newsletter section`
- social links: `Site Settings -> Social links`
- footer copy: `Site Settings -> Footer`

## How To Manage The Letters Pages

The three editorial letter pages are:

- `/letters/younger-me`
- `/letters/current-me`
- `/letters/future-me`

Create these categories in `Categories`:

- `Younger Me`
- `Current Me`
- `Future Me`

Assign posts to those categories and they will automatically appear in the matching letters page.

If you want custom intro copy or a top image for a letters page, create matching `Pages` documents with these slugs:

- `letters-younger-me`
- `letters-current-me`
- `letters-future-me`

## How To Add A Blog Post Or Letter

1. Open `Posts`.
2. Click `Create new`.
3. Add a title, excerpt, categories, and body content.
4. Upload a featured image only if you want one. Empty image cards are hidden automatically.
5. Publish the post.
6. If you want it featured on the homepage, turn on `Feature on homepage`.

You can also add inline images inside the body content editor. Those images are optional and will appear inside the story.

## How To Update Email And Social Handles

Open:

- `Site Settings -> Contact details`
- `Site Settings -> Social links`

Change the values there and publish. The frontend will use those published values everywhere, including the fallback contact email and social icons.

## How To View Newsletter Subscribers

Every newsletter signup from the website is stored in:

- `Subscribers`

After someone subscribes, the browser remembers that subscription and the newsletter page opens in a subscribed state on future visits from that device.

If `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured, you will also receive an email notification.

## How To Export CSV Reports

Open:

- `Studio -> Reports`

You can export:

- newsletter subscribers
- comments and replies

Choose a `From date` and `To date`, then click `Download CSV`.

## How To Moderate Comments And Replies

Every comment and reply from the website is stored in:

- `Comments`

Workflow:

1. Open a pending comment.
2. Review the name, email, message, and linked post.
3. Turn on `Approved for public display`.
4. Publish the document.

Only approved comments and replies appear publicly.

## How To View Contact Form Messages

Every contact form submission is stored in:

- `Contact Messages`

Workflow:

1. Open a message.
2. Read the name, email, subject, and message body.
3. Turn on `Reviewed` when you have handled it.
4. Publish if you changed the review status.

If email notifications are configured, you will also receive a notification at the contact email from `Site Settings`, or the hardcoded fallback email if the Studio field is empty.
