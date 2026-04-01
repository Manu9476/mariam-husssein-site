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

  await sanityWriteClient.create({
    _type: "comment",
    post: {
      _type: "reference",
      _ref: parsed.data.postId,
    },
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    approved: false,
    createdAt: new Date().toISOString(),
  });

  return {
    ok: true,
    status: 200,
    message:
      "Thank you. Your comment has been received and is waiting for approval.",
  };
}
