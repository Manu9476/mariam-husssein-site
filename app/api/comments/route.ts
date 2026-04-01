import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { handleCommentSubmission } from "@/lib/forms/comments";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await handleCommentSubmission(payload);
    const response = NextResponse.json(
      {
        message: result.message,
      },
      {
        status: result.status,
      },
    );

    if (result.ok && "pathsToRevalidate" in result && Array.isArray(result.pathsToRevalidate)) {
      for (const path of result.pathsToRevalidate) {
        revalidatePath(path);
      }
    }

    if (result.ok && "commenterEmail" in result && result.commenterEmail) {
      response.cookies.set("mh_commenter_email", result.commenterEmail, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 10,
        sameSite: "lax",
      });
    }

    if (result.ok && "commenterName" in result && result.commenterName) {
      response.cookies.set("mh_commenter_name", result.commenterName, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 10,
        sameSite: "lax",
      });
    }

    return response;
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
