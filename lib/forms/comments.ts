import {
  formatNotificationLine,
  formatNotificationMessage,
  sendSubmissionNotification,
} from "@/lib/forms/notifications";
import { getPostRevalidationPaths } from "@/lib/post-revalidation";
import { sanityWriteClient } from "@/lib/sanity/client";
import { commentSchema, type CommentInput } from "@/lib/validators";

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

  if (!sanityWriteClient) {
    return {
      ok: false,
      status: 500,
      message: "Comments are not available right now. Please try again shortly.",
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

  const targetPost = await sanityWriteClient.fetch<{
    slug?: string;
    categorySlugs?: Array<string | null>;
  } | null>(
    `*[_type == "post" && _id == $postId][0]{
      "slug": slug.current,
      "categorySlugs": categories[]->slug.current
    }`,
    { postId: parsed.data.postId },
  );

  if (!targetPost?.slug) {
    return {
      ok: false,
      status: 404,
      message: "That post is no longer available for comments.",
    };
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
    approved: true,
    flagged: false,
    likeCount: 0,
    createdAt: new Date().toISOString(),
  });

  const notification = await sendSubmissionNotification({
    kind: "comment",
    subject: parsed.data.parentId ? "New public comment reply" : "New public comment",
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
      "<p>A new comment was submitted from the website and is now visible on the post.</p>",
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
    commenterName: parsed.data.name,
    commenterEmail: parsed.data.email,
    message: notification.ok
      ? "Thank you. Your comment is now live."
      : "Thank you. Your comment is now live.",
    pathsToRevalidate: getPostRevalidationPaths(targetPost),
  };
}
