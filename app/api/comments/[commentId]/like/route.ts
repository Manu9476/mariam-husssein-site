import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getPostRevalidationPaths } from "@/lib/post-revalidation";
import { sanityWriteClient } from "@/lib/sanity/client";

function getCommentIdFromRequest(request: Request) {
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/\/api\/comments\/(.+)\/like$/);

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function handleLikeRequest(request: Request, action: "like" | "unlike") {
  if (!sanityWriteClient) {
    return NextResponse.json(
      {
        message: "Comment likes are ready, but SANITY_API_WRITE_TOKEN is not configured yet.",
      },
      { status: 500 },
    );
  }

  const commentId = getCommentIdFromRequest(request);

  if (!commentId) {
    return NextResponse.json(
      {
        message: "That comment could not be found.",
      },
      { status: 400 },
    );
  }

  const comment = await sanityWriteClient.fetch<{
    likeCount?: number;
    post?: {
      slug?: string;
      categorySlugs?: Array<string | null>;
    };
  } | null>(
    `*[_type == "comment" && _id == $commentId][0]{
      "likeCount": coalesce(likeCount, 0),
      post->{
        "slug": slug.current,
        "categorySlugs": categories[]->slug.current
      }
    }`,
    { commentId },
  );

  if (!comment?.post?.slug) {
    return NextResponse.json(
      {
        message: "That comment could not be found.",
      },
      { status: 404 },
    );
  }

  const nextLikeCount =
    action === "like"
      ? (comment.likeCount || 0) + 1
      : Math.max(0, (comment.likeCount || 0) - 1);

  await sanityWriteClient.patch(commentId).set({ likeCount: nextLikeCount }).commit();

  for (const path of getPostRevalidationPaths(comment.post)) {
    revalidatePath(path);
  }

  return NextResponse.json({
    likeCount: nextLikeCount,
    liked: action === "like",
  });
}

export async function POST(request: Request) {
  return handleLikeRequest(request, "like");
}

export async function DELETE(request: Request) {
  return handleLikeRequest(request, "unlike");
}
