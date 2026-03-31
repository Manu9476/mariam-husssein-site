import { cn } from "@/lib/utils";

function Skeleton({
  className,
}: {
  className?: string;
}) {
  return <div className={cn("animate-pulse rounded-xl bg-secondary", className)} />;
}

export function CardGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="editorial-panel space-y-4 p-6"
        >
          <Skeleton className="h-56 w-full rounded-md" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-16 w-full max-w-3xl" />
        <Skeleton className="h-6 w-full max-w-2xl" />
        <Skeleton className="h-6 w-4/5 max-w-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>
      <Skeleton className="min-h-[420px] rounded-md" />
    </div>
  );
}
