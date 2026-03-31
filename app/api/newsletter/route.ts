import { NextResponse } from "next/server";

import { handleNewsletterSignup } from "@/lib/forms/newsletter";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await handleNewsletterSignup(payload);

    return NextResponse.json(
      {
        message: result.message,
      },
      {
        status: result.ok ? 200 : 400,
      },
    );
  } catch {
    return NextResponse.json(
      {
        message: "Something went wrong while saving your subscription.",
      },
      {
        status: 500,
      },
    );
  }
}
