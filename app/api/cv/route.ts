import { NextResponse } from "next/server";

import { getSiteSettings } from "@/lib/api/wordpress";

export async function GET() {
  const settings = await getSiteSettings();
  const cvFile = settings.profile.resume.cvFile;

  if (!cvFile?.url) {
    return NextResponse.json({ message: "No CV is available yet." }, { status: 404 });
  }

  const response = await fetch(cvFile.url, {
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    return NextResponse.json({ message: "Unable to download the CV right now." }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", cvFile.mimeType || response.headers.get("Content-Type") || "application/pdf");
  headers.set(
    "Content-Disposition",
    `attachment; filename="${cvFile.filename || "Mariam-Husssein-CV.pdf"}"`,
  );

  return new NextResponse(response.body, {
    status: 200,
    headers,
  });
}
