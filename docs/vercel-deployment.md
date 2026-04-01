# Vercel Deployment

## 1. Push The Frontend Repository

Push this project to GitHub.

## 2. Import Into Vercel

1. Create a new Vercel project.
2. Import the repository.
3. Keep the framework preset as `Next.js`.
4. Leave the root directory as `./`.

## 3. Add Environment Variables

At minimum, set:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_WRITE_TOKEN`

For email notifications from contact forms, comments, and subscribers, also set:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Optional override:

- `CONTACT_NOTIFICATION_TO`

If `CONTACT_NOTIFICATION_TO` is empty, the site will use the contact email from `Site Settings` in Sanity Studio, then fall back to the built-in default email.

## 4. Deploy

Trigger the first deployment. The live frontend and the embedded Studio will both run from Vercel.

## 5. Connect A Custom Domain

In Vercel:

1. Open your project.
2. Go to `Settings -> Domains`.
3. Add your primary domain.
4. Update your DNS records at your domain registrar as instructed by Vercel.
5. After the domain is live, update `NEXT_PUBLIC_SITE_URL` to match the production domain.

## 6. Production Notes

- The public website and Sanity Studio can both live in the same Vercel project.
- Open the Studio at `/studio`.
- Contact form submissions, newsletter signups, comments, and replies are stored in Sanity.
- Published content changes may take a few minutes to appear on the live frontend because the site uses revalidation.
