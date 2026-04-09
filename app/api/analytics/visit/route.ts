import { NextResponse } from "next/server";

import { sanityWriteClient } from "@/lib/sanity/client";

type VisitPayload = {
  visitorId?: string;
  path?: string;
  referrer?: string;
};

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function sanitizePath(value: unknown) {
  const path = sanitizeText(value, 180);

  if (!path.startsWith("/")) {
    return "";
  }

  return path;
}

function isLikelyBot(userAgent: string) {
  return /bot|crawl|crawler|spider|preview|headless|slurp|facebookexternalhit|whatsapp/i.test(
    userAgent,
  );
}

export async function POST(request: Request) {
  if (!sanityWriteClient) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  try {
    const payload = (await request.json()) as VisitPayload;
    const visitorId = sanitizeText(payload.visitorId, 120);
    const path = sanitizePath(payload.path);
    const referrer = sanitizeText(payload.referrer, 300);
    const userAgent = sanitizeText(request.headers.get("user-agent"), 300);

    if (!visitorId || !path || isLikelyBot(userAgent)) {
      return NextResponse.json({ ok: true }, { status: 202 });
    }

    await sanityWriteClient.create({
      _type: "siteVisit",
      visitorId,
      path,
      referrer,
      userAgent,
      visitedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
