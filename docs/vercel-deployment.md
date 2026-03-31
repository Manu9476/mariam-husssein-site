# Vercel Deployment

## 1. Push The Frontend Repository

Push this project to GitHub, GitLab, or Bitbucket.

## 2. Import Into Vercel

1. Create a new Vercel project.
2. Import the repository.
3. Keep the framework preset as `Next.js`.

## 3. Add Environment Variables

At minimum, set:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WORDPRESS_URL`
- `CONTACT_DESTINATION`
- `WORDPRESS_CONTACT_FORM_ENDPOINT`
- `WORDPRESS_REVIEW_SUBMISSION_ENDPOINT`
- `NEWSLETTER_PROVIDER`

If you connect newsletter providers or webhooks, also set the matching endpoint variables from `.env.example`.

## 4. Deploy

Trigger the first deployment.

The frontend will fetch content from your separate WordPress installation on cPanel while Vercel only hosts the public Next.js site.

## 5. Connect A Custom Domain

In Vercel:

1. Open your project.
2. Go to `Settings -> Domains`.
3. Add your primary domain.
4. Update your DNS records at your domain registrar as instructed by Vercel.
5. After the domain is live, update `NEXT_PUBLIC_SITE_URL` to match the production domain.

## 6. Production Notes

- Keep WordPress and Vercel on separate domains or subdomains.
- The frontend already fetches content server-side, so direct browser CORS configuration is not required for the main content flow.
- Form submissions are proxied through Next.js route handlers before being sent to WordPress.
- If WordPress media lives on a different hostname, keep `NEXT_PUBLIC_WORDPRESS_URL` pointed to that WordPress install so Next.js image optimization can allow it.
