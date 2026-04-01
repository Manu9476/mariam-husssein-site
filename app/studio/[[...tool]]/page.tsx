"use client";

import { NextStudio } from "next-sanity/studio";

import { hasValidSanityConfig } from "@/lib/sanity/env";
import config from "@/sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  if (!hasValidSanityConfig()) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-20">
        <div className="w-full rounded-2xl border border-border bg-white p-8 shadow-sm">
          <p className="eyebrow">Studio setup</p>
          <h1 className="mt-3 text-4xl">Sanity environment variables are missing.</h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Add <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
            <code>NEXT_PUBLIC_SANITY_DATASET</code> in Vercel, then redeploy the app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-root">
      <NextStudio config={config} />
    </div>
  );
}
