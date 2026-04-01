import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getPostRevalidationPaths } from "@/lib/post-revalidation";
import { sanityWriteClient } from "@/lib/sanity/client";

function getPostIdFromRequest(request: Request) {
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/\/api\/posts\/(.+)\/like$/);

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request) {
  if (!sanityWriteClient) {
    return NextResponse.json(
      {
        message: "Likes are ready, but SANITY_API_WRITE_TOKEN is not configured yet.",
      },
      {
        status: 500,
      },
    );
  }

  const postId = getPostIdFromRequest(request);

  if (!postId) {
    return NextResponse.json(
      {
        message: "That post could not be found.",
      },
      {
        status: 400,
      },
    );
  }

  const post = await sanityWriteClient.fetch<{
    slug?: string;
    likeCount?: number;
    categorySlugs?: Array<string | null>;
  } | null>(
    `*[_type == "post" && _id == $postId][0]{
      "slug": slug.current,
      "likeCount": coalesce(likeCount, 0),
      "categorySlugs": categories[]->slug.current
    }`,
    { postId },
  );

  if (!post?.slug) {
    return NextResponse.json(
      {
        message: "That post could not be found.",
      },
      {
        status: 404,
      },
    );
  }

  await sanityWriteClient
    .patch(postId)
    .setIfMissing({ likeCount: 0 })
    .inc({ likeCount: 1 })
    .commit();

  const updated = await sanityWriteClient.fetch<{ likeCount?: number } | null>(
    `*[_type == "post" && _id == $postId][0]{
      "likeCount": coalesce(likeCount, 0)
    }`,
    { postId },
  );

  for (const path of getPostRevalidationPaths(post)) {
    revalidatePath(path);
  }

  return NextResponse.json({
    likeCount: updated?.likeCount ?? (post.likeCount || 0) + 1,
  });
}
