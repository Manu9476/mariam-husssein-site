import { contactSchema, type ContactInput } from "@/lib/validators";

const WORDPRESS_CONTACT_ENDPOINT =
  process.env.WORDPRESS_CONTACT_FORM_ENDPOINT ||
  (process.env.NEXT_PUBLIC_WORDPRESS_URL
    ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL.replace(/\/$/, "")}/wp-json/mh-site/v1/contact`
    : "");

export async function handleContactSubmission(payload: ContactInput) {
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Please check your message and try again.",
    };
  }

  const destination = process.env.CONTACT_DESTINATION || "wordpress";

  if (destination === "wordpress" && WORDPRESS_CONTACT_ENDPOINT) {
    const response = await fetch(WORDPRESS_CONTACT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    if (response.ok) {
      return {
        ok: true,
        message: "Your note has been sent. Mariam will review it soon.",
      };
    }
  }

  if (destination === "webhook" && process.env.CONTACT_WEBHOOK_URL) {
    const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    if (response.ok) {
      return {
        ok: true,
        message: "Your note has been sent. Mariam will review it soon.",
      };
    }
  }

  return {
    ok: true,
    message:
      "The contact form is running in placeholder mode. Connect WordPress or a webhook to receive submissions in production.",
  };
}
