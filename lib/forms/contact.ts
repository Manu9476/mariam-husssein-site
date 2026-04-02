import {
  formatNotificationLine,
  formatNotificationMessage,
  sendSubmissionNotification,
} from "@/lib/forms/notifications";
import { sanityWriteClient } from "@/lib/sanity/client";
import { contactSchema, type ContactInput } from "@/lib/validators";

const MIN_FORM_FILL_TIME_MS = 1500;

export async function handleContactSubmission(payload: ContactInput) {
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message:
        parsed.error.issues[0]?.message ||
        "Please check your message and try again.",
    };
  }

  if (parsed.data.website) {
    return {
      ok: true,
      status: 200,
      message: "Your note has been received.",
    };
  }

  const startedAtNumber = Number(parsed.data.startedAt || 0);
  if (startedAtNumber && Date.now() - startedAtNumber < MIN_FORM_FILL_TIME_MS) {
    return {
      ok: false,
      status: 400,
      message: "Please take a little more time before sending your message.",
    };
  }

  if (!sanityWriteClient) {
    return {
      ok: false,
      status: 500,
      message: "The contact form is not available right now. Please try again shortly.",
    };
  }

  await sanityWriteClient.create({
    _type: "contactMessage",
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    reviewed: false,
    createdAt: new Date().toISOString(),
    source: "website",
  });

  const notification = await sendSubmissionNotification({
    kind: "contact",
    subject: `New contact message: ${parsed.data.subject}`,
    replyTo: parsed.data.email,
    text: [
      "A new contact message was submitted from the website.",
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Subject: ${parsed.data.subject}`,
      "",
      parsed.data.message,
    ].join("\n"),
    html: [
      "<h2>New contact message</h2>",
      "<p>A new contact message was submitted from the website.</p>",
      formatNotificationLine("Name", parsed.data.name),
      formatNotificationLine("Email", parsed.data.email),
      formatNotificationLine("Subject", parsed.data.subject),
      "<hr />",
      formatNotificationMessage(parsed.data.message),
    ].join(""),
  });

  if (!notification.ok && !notification.skipped) {
    console.error("Contact notification email could not be sent.");
  }

  return {
    ok: true,
    status: 200,
    message: notification.ok
      ? "Your note has been sent successfully."
      : "Your note has been sent.",
  };
}
