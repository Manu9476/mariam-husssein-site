import { NextResponse } from "next/server";

import { handleNewsletterSignup } from "@/lib/forms/newsletter";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await handleNewsletterSignup(payload);
    const response = NextResponse.json(
      {
        message: result.message,
        subscriberEmail: result.subscriberEmail ?? null,
      },
      {
        status: result.ok ? 200 : 400,
      },
    );

    if (result.ok && result.subscriberEmail) {
      response.cookies.set("mh_newsletter_subscriber", result.subscriberEmail, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 10,
        sameSite: "lax",
      });
    }

    return response;
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
