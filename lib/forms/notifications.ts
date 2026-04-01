import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";
import { sanityWriteClient } from "@/lib/sanity/client";

type NotificationKind = "comment" | "contact" | "subscriber";

type SubmissionNotification = {
  kind: NotificationKind;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

type NotificationResult = {
  ok: boolean;
  skipped: boolean;
  to: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function getNotificationEmail() {
  const envOverride = process.env.CONTACT_NOTIFICATION_TO?.trim();

  if (envOverride) {
    return envOverride;
  }

  if (sanityWriteClient) {
    try {
      const siteEmail = await sanityWriteClient.fetch<string | null>(
        `*[_type == "siteSettings"][0].contact.email`,
      );

      if (siteEmail?.trim()) {
        return siteEmail.trim();
      }
    } catch {
      return DEFAULT_CONTACT_EMAIL;
    }
  }

  return DEFAULT_CONTACT_EMAIL;
}

export async function sendSubmissionNotification(
  notification: SubmissionNotification,
): Promise<NotificationResult> {
  const to = await getNotificationEmail();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      to,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mariam-husssein-site/1.0",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: notification.subject,
      text: notification.text,
      html: notification.html,
      ...(notification.replyTo ? { replyTo: notification.replyTo } : {}),
      tags: [
        { name: "source", value: "website" },
        { name: "type", value: notification.kind },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      skipped: false,
      to,
    };
  }

  return {
    ok: true,
    skipped: false,
    to,
  };
}

export function formatNotificationLine(label: string, value: string) {
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);

  return `<p><strong>${safeLabel}:</strong> ${safeValue}</p>`;
}

export function formatNotificationMessage(message: string) {
  const paragraphs = message
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}
