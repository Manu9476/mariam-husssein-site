import { NextResponse } from "next/server";

import { forwardReviewSubmission } from "@/lib/forms/reviews";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await forwardReviewSubmission(formData);

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
        message: "Something went wrong while submitting your review.",
      },
      {
        status: 500,
      },
    );
  }
}
