import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { handleCommentSubmission } from "@/lib/forms/comments";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await handleCommentSubmission(payload);

    if (result.ok && "pathsToRevalidate" in result && Array.isArray(result.pathsToRevalidate)) {
      for (const path of result.pathsToRevalidate) {
        revalidatePath(path);
      }
    }

    return NextResponse.json(
      {
        message: result.message,
      },
      {
        status: result.status,
      },
    );
  } catch {
    return NextResponse.json(
      {
        message: "Something went wrong while sending your comment.",
      },
      {
        status: 500,
      },
    );
  }
}
