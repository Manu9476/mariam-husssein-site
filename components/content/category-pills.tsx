import Link from "next/link";

import { cn } from "@/lib/utils";
import type { CategorySummary } from "@/types/content";

export function CategoryPills({
  categories,
  activeSlug,
  query,
}: {
  categories: CategorySummary[];
  activeSlug?: string;
  query?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={query ? `/blog?query=${encodeURIComponent(query)}` : "/blog"}
        className={cn(
          "rounded-full border px-4 py-2 font-serif text-[12px] uppercase tracking-[0.14em] transition",
          !activeSlug
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-border bg-card text-primary hover:bg-accent/50",
        )}
      >
        All notes
      </Link>
      {categories.map((category) => {
        const href = query
          ? `/blog?category=${category.slug}&query=${encodeURIComponent(query)}`
          : `/blog?category=${category.slug}`;

        return (
          <Link
            key={category.id}
            href={href}
            className={cn(
              "rounded-full border px-4 py-2 font-serif text-[12px] uppercase tracking-[0.14em] transition",
              activeSlug === category.slug
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-primary hover:bg-accent/50",
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
