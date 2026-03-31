import Link from "next/link";

import { LETTER_COLLECTIONS, type LetterCollectionSlug } from "@/lib/letters";
import { cn } from "@/lib/utils";

export function LettersNav({
  activeSlug,
  className,
}: {
  activeSlug: LetterCollectionSlug;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-t border-border/70 pt-6",
        className,
      )}
      aria-label="Letters collections"
    >
      {LETTER_COLLECTIONS.map((collection) => {
        const active = collection.slug === activeSlug;

        return (
          <Link
            key={collection.slug}
            href={collection.path}
            className={cn(
              "border-b-2 pb-2 font-serif text-[12px] uppercase tracking-[0.18em] transition",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-foreground/75 hover:border-border hover:text-primary",
            )}
          >
            {collection.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
