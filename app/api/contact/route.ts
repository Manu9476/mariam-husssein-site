import { NextResponse } from "next/server";

import { handleContactSubmission } from "@/lib/forms/contact";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await handleContactSubmission(payload);

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
        message: "Something went wrong while sending your message.",
      },
      {
        status: 500,
      },
    );
  }
}
