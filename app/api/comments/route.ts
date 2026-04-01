import { NextResponse } from "next/server";

import { handleCommentSubmission } from "@/lib/forms/comments";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await handleCommentSubmission(payload);

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
