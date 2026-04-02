import { createHash } from "crypto";

import {
  formatNotificationLine,
  sendSubmissionNotification,
} from "@/lib/forms/notifications";
import { sanityWriteClient } from "@/lib/sanity/client";
import { newsletterSchema, type NewsletterInput } from "@/lib/validators";

type Provider = "none" | "mailchimp" | "convertkit" | "beehiiv" | "webhook";

type ProviderConfig = {
  endpoint?: string;
  transform?: (email: string) => Record<string, unknown>;
};

const providers: Record<Exclude<Provider, "none">, ProviderConfig> = {
  mailchimp: {
    endpoint: process.env.MAILCHIMP_SUBSCRIBE_URL,
    transform: (email) => ({ email }),
  },
  convertkit: {
    endpoint: process.env.CONVERTKIT_SUBSCRIBE_URL,
    transform: (email) => ({ email }),
  },
  beehiiv: {
    endpoint: process.env.BEEHIIV_SUBSCRIBE_URL,
    transform: (email) => ({ email }),
  },
  webhook: {
    endpoint: process.env.NEWSLETTER_WEBHOOK_URL,
    transform: (email) => ({ email }),
  },
};

export async function handleNewsletterSignup(payload: NewsletterInput) {
  const parsed = newsletterSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Please enter a valid email address.",
      subscriberEmail: undefined,
    };
  }

  if (parsed.data.website) {
    return {
      ok: true,
      message: "Thanks. Your email has been received.",
      subscriberEmail: undefined,
    };
  }

  const startedAtNumber = Number(parsed.data.startedAt || 0);
  if (startedAtNumber && Date.now() - startedAtNumber < 1500) {
    return {
      ok: false,
      message: "Please take a little more time before submitting the form.",
      subscriberEmail: undefined,
    };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  if (sanityWriteClient) {
    const subscriberId = `newsletterSubscriber.${createHash("sha256")
      .update(normalizedEmail)
      .digest("hex")
      .slice(0, 32)}`;

    await sanityWriteClient.createIfNotExists({
      _id: subscriberId,
      _type: "newsletterSubscriber",
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      source: "website",
    });
  }

  const provider = (process.env.NEWSLETTER_PROVIDER || "none") as Provider;

  if (provider === "none") {
    if (sanityWriteClient) {
      const notification = await sendSubmissionNotification({
        kind: "subscriber",
        subject: "New newsletter subscriber",
        text: [
          "A new subscriber joined from the website.",
          `Email: ${normalizedEmail}`,
        ].join("\n"),
        html: [
          "<h2>New newsletter subscriber</h2>",
          "<p>A new subscriber joined from the website.</p>",
          formatNotificationLine("Email", normalizedEmail),
        ].join(""),
      });

      if (!notification.ok && !notification.skipped) {
        console.error("Subscriber notification email could not be sent.");
      }

      return {
        ok: true,
        message: notification.ok
          ? "Thanks. You're on the list."
          : "Thanks. You're on the list.",
        subscriberEmail: normalizedEmail,
      };
    }

    return {
      ok: false,
      message: "Subscriptions are not available right now. Please try again shortly.",
      subscriberEmail: undefined,
    };
  }

  const config = providers[provider];

  if (!config?.endpoint) {
    return {
      ok: false,
      message: `The ${provider} adapter is selected but not configured yet.`,
      subscriberEmail: undefined,
    };
  }

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.transform?.(normalizedEmail) ?? { email: normalizedEmail }),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      message: "We could not save your subscription right now. Please try again shortly.",
      subscriberEmail: undefined,
    };
  }

  const notification = await sendSubmissionNotification({
    kind: "subscriber",
    subject: "New newsletter subscriber",
    text: [
      "A new subscriber joined from the website.",
      `Email: ${normalizedEmail}`,
    ].join("\n"),
    html: [
      "<h2>New newsletter subscriber</h2>",
      "<p>A new subscriber joined from the website.</p>",
      formatNotificationLine("Email", normalizedEmail),
    ].join(""),
  });

  if (!notification.ok && !notification.skipped) {
    console.error("Subscriber notification email could not be sent.");
  }

  return {
    ok: true,
    message: sanityWriteClient
      ? notification.ok
        ? "Thanks. You're on the list."
        : "Thanks. You're on the list."
      : "Thanks. You're on the list.",
    subscriberEmail: normalizedEmail,
  };
}
