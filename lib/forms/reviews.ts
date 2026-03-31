import { reviewSchema } from "@/lib/validators";

const WORDPRESS_REVIEW_ENDPOINT =
  process.env.WORDPRESS_REVIEW_SUBMISSION_ENDPOINT ||
  (process.env.NEXT_PUBLIC_WORDPRESS_URL
    ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL.replace(/\/$/, "")}/wp-json/mh-site/v1/testimonials/submit`
    : "");

export async function forwardReviewSubmission(formData: FormData) {
  const payload = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    rating: String(formData.get("rating") || ""),
    message: String(formData.get("message") || ""),
    website: String(formData.get("website") || ""),
    startedAt: String(formData.get("startedAt") || ""),
  };

  const parsed = reviewSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message: parsed.error.issues[0]?.message || "Please review your testimonial before sending.",
    };
  }

  if (!WORDPRESS_REVIEW_ENDPOINT) {
    return {
      ok: false,
      status: 500,
      message:
        "The review form is ready, but the WordPress review endpoint is not configured yet.",
    };
  }

  const response = await fetch(WORDPRESS_REVIEW_ENDPOINT, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        data?.message ||
        "We could not submit your review right now. Please try again shortly.",
    };
  }

  return {
    ok: true,
    status: 200,
    message:
      data?.message ||
      "Thank you. Your testimonial has been received and is waiting for approval.",
  };
}
