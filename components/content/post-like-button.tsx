"use client";

import { Heart } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContentId } from "@/types/content";

const POST_LIKED_EVENT = "mh:post-liked";

function getStorageKey(postId: string) {
  return `mh-post-liked:${postId}`;
}

export function PostLikeButton({
  postId,
  initialCount = 0,
  compact = false,
  prominent = false,
  className,
}: {
  postId: ContentId;
  initialCount?: number;
  compact?: boolean;
  prominent?: boolean;
  className?: string;
}) {
  const normalizedPostId = useMemo(() => String(postId), [postId]);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setLiked(window.localStorage.getItem(getStorageKey(normalizedPostId)) === "1");

    function onPostLiked(event: Event) {
      const detail = (event as CustomEvent<{ postId: string; count: number }>).detail;

      if (detail?.postId === normalizedPostId) {
        setLiked(true);
        setCount(detail.count);
      }
    }

    window.addEventListener(POST_LIKED_EVENT, onPostLiked as EventListener);

    return () => {
      window.removeEventListener(POST_LIKED_EVENT, onPostLiked as EventListener);
    };
  }, [normalizedPostId]);

  function onLike() {
    if (liked || isPending) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/posts/${encodeURIComponent(normalizedPostId)}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { likeCount?: number };
      const nextCount = typeof data.likeCount === "number" ? data.likeCount : count + 1;

      setLiked(true);
      setCount(nextCount);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(getStorageKey(normalizedPostId), "1");
        window.dispatchEvent(
          new CustomEvent(POST_LIKED_EVENT, {
            detail: {
              postId: normalizedPostId,
              count: nextCount,
            },
          }),
        );
      }
    });
  }

  return (
    <Button
      type="button"
      variant={prominent ? "outline" : "ghost"}
      size={compact ? "sm" : "default"}
      onClick={onLike}
      disabled={liked || isPending}
      className={cn(
        prominent
          ? "group h-12 rounded-full border border-border/80 bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm hover:border-red-400 hover:bg-white hover:text-red-500"
          : "group h-auto rounded-full px-0 py-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:bg-transparent hover:text-primary",
        compact ? "gap-1.5 text-[10px] tracking-[0.18em]" : prominent ? "gap-2.5" : "gap-2 text-[11px]",
        liked
          ? prominent
            ? "border-red-200 bg-red-50 text-red-500"
            : "text-red-500"
          : "",
        className,
      )}
      aria-label={liked ? "Post liked" : "Like this post"}
    >
      <Heart
        className={cn(
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
          liked ? "fill-current" : "fill-transparent",
        )}
      />
      <span>{liked ? "Liked" : "Like"}</span>
      <span>{count}</span>
    </Button>
  );
}
