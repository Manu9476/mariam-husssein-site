import { CardGridSkeleton, HeroSkeleton } from "@/components/shared/loading-skeletons";

export default function Loading() {
  return (
    <div className="container section-space space-y-12">
      <HeroSkeleton />
      <CardGridSkeleton />
    </div>
  );
}
