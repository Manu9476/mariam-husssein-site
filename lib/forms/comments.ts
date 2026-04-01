import {
  formatNotificationLine,
  formatNotificationMessage,
  sendSubmissionNotification,
} from "@/lib/forms/notifications";
import { sanityWriteClient } from "@/lib/sanity/client";
import { commentSchema, type CommentInput } from "@/lib/validators";

const MIN_FORM_FILL_TIME_MS = 1500;

export async function handleCommentSubmission(payload: CommentInput) {
  const parsed = commentSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message:
        parsed.error.issues[0]?.message ||
        "Please review your comment and try again.",
    };
  }

  if (parsed.data.website) {
    return {
      ok: true,
      status: 200,
      message: "Thank you. Your comment has been received.",
    };
  }

  const startedAtNumber = Number(parsed.data.startedAt || 0);
  if (startedAtNumber && Date.now() - startedAtNumber < MIN_FORM_FILL_TIME_MS) {
    return {
      ok: false,
      status: 400,
      message: "Please take a little more time before submitting your comment.",
    };
  }

  if (!sanityWriteClient) {
    return {
      ok: false,
      status: 500,
      message:
        "Comments are ready, but SANITY_API_WRITE_TOKEN is not configured yet.",
    };
  }

  if (parsed.data.parentId) {
    const parentComment = await sanityWriteClient.fetch<{ post?: { _id?: string } } | null>(
      `*[_type == "comment" && _id == $commentId][0]{
        post->{
          _id
        }
      }`,
      { commentId: parsed.data.parentId },
    );

    if (!parentComment?.post?._id || parentComment.post._id !== parsed.data.postId) {
      return {
        ok: false,
        status: 400,
        message: "That reply target is no longer available.",
      };
    }
  }

  await sanityWriteClient.create({
    _type: "comment",
    post: {
      _type: "reference",
      _ref: parsed.data.postId,
    },
    ...(parsed.data.parentId
      ? {
          parentComment: {
            _type: "reference",
            _ref: parsed.data.parentId,
          },
        }
      : {}),
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    approved: false,
    createdAt: new Date().toISOString(),
  });

  const notification = await sendSubmissionNotification({
    kind: "comment",
    subject: parsed.data.parentId ? "New comment reply awaiting approval" : "New comment awaiting approval",
    replyTo: parsed.data.email,
    text: [
      parsed.data.parentId
        ? "A new comment reply was submitted from the website."
        : "A new comment was submitted from the website.",
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Post ID: ${parsed.data.postId}`,
      "",
      parsed.data.message,
    ].join("\n"),
    html: [
      `<h2>${parsed.data.parentId ? "New comment reply" : "New comment"}</h2>`,
      "<p>A new comment was submitted from the website and is waiting for approval.</p>",
      formatNotificationLine("Name", parsed.data.name),
      formatNotificationLine("Email", parsed.data.email),
      formatNotificationLine("Post ID", parsed.data.postId),
      ...(parsed.data.parentId
        ? [formatNotificationLine("Replying to comment", parsed.data.parentId)]
        : []),
      "<hr />",
      formatNotificationMessage(parsed.data.message),
    ].join(""),
  });

  if (!notification.ok && !notification.skipped) {
    console.error("Comment notification email could not be sent.");
  }

  return {
    ok: true,
    status: 200,
    message: notification.ok
      ? "Thank you. Your comment has been received, saved in Sanity Studio, and an email notification has been sent."
      : "Thank you. Your comment has been received and is waiting for approval.",
  };
}
