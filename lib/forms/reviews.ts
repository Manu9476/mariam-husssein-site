import { isSanityConfigured, sanityWriteClient } from "@/lib/sanity/client";
import { reviewSchema } from "@/lib/validators";

const WORDPRESS_REVIEW_ENDPOINT =
  process.env.WORDPRESS_REVIEW_SUBMISSION_ENDPOINT ||
  (process.env.NEXT_PUBLIC_WORDPRESS_URL
    ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL.replace(/\/$/, "")}/wp-json/mh-site/v1/testimonials/submit`
    : "");

const MIN_FORM_FILL_TIME_MS = 1500;

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

  if (payload.website) {
    return {
      ok: true,
      status: 200,
      message: "Thank you. Your testimonial has been received.",
    };
  }

  const startedAtNumber = Number(payload.startedAt || 0);
  if (startedAtNumber && Date.now() - startedAtNumber < MIN_FORM_FILL_TIME_MS) {
    return {
      ok: false,
      status: 400,
      message: "Please take a little more time before submitting the form.",
    };
  }

  if (isSanityConfigured() && sanityWriteClient) {
    const photo = formData.get("photo");
    let photoField:
      | {
          _type: "image";
          asset: {
            _type: "reference";
            _ref: string;
          };
          alt?: string;
        }
      | undefined;

    if (photo instanceof File && photo.size > 0) {
      const asset = await sanityWriteClient.assets.upload("image", photo, {
        filename: photo.name,
        contentType: photo.type || undefined,
      });

      photoField = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
        alt: parsed.data.name,
      };
    }

    await sanityWriteClient.create({
      _type: "testimonial",
      name: parsed.data.name,
      email: parsed.data.email,
      rating: parsed.data.rating,
      quote: parsed.data.message,
      approved: false,
      ...(photoField ? { photo: photoField } : {}),
    });

    return {
      ok: true,
      status: 200,
      message:
        "Thank you. Your testimonial has been received and is waiting for approval.",
    };
  }

  if (!WORDPRESS_REVIEW_ENDPOINT) {
    return {
      ok: false,
      status: 500,
      message:
        "The review form is not available right now. Please try again shortly.",
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
