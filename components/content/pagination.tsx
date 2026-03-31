import Link from "next/link";

import { Button } from "@/components/ui/button";

function makeHref(page: number, query?: string, category?: string) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (query) {
    params.set("query", query);
  }

  if (category) {
    params.set("category", category);
  }

  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
}

export function Pagination({
  currentPage,
  totalPages,
  query,
  category,
}: {
  currentPage: number;
  totalPages: number;
  query?: string;
  category?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border/80 bg-[#f8fcfa] px-6 py-5 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-3">
        <Button
          asChild
          variant="outline"
          className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
        >
          <Link href={makeHref(currentPage - 1, query, category)}>Previous</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className={
            currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined
          }
        >
          <Link href={makeHref(currentPage + 1, query, category)}>Next</Link>
        </Button>
      </div>
    </div>
  );
}
