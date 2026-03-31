import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="editorial-panel max-w-2xl space-y-6 p-10 text-center">
        <p className="eyebrow">404</p>
        <h1 className="text-5xl leading-none md:text-6xl">
          This page slipped quietly out of frame.
        </h1>
        <p>
          The link may have moved, or the content has not been published yet. You can head back home or explore the journal instead.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blog">Browse the journal</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
