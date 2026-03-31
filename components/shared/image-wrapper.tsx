import Image from "next/image";

import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/content";

export function ImageWrapper({
  image,
  alt,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  fill = false,
}: {
  image?: ImageAsset | null;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  if (!image?.url) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[240px] w-full items-center justify-center rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground",
          className,
        )}
      >
        Photo coming soon
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={image.url}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={image.url}
      alt={alt || image.alt}
      width={image.width || 1400}
      height={image.height || 1000}
      priority={priority}
      sizes={sizes}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
