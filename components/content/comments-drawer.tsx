"use client";

import { Heart, MessageCircleMore } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { CommentForm } from "@/components/forms/comment-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CommentEntry, ContentId } from "@/types/content";

const COMMENT_LIKED_EVENT = "mh:comment-liked";

function countComments(entries: CommentEntry[]): number {
  return entries.reduce(
    (total, entry) => total + 1 + countComments(entry.replies ?? []),
    0,
  );
}

function getCommentStorageKey(commentId: string) {
  return `mh-comment-liked:${commentId}`;
}

function hashNameToTone(name: string) {
  const tones = [
    "bg-[#78423d]",
    "bg-[#4f5d95]",
    "bg-[#6a4c93]",
    "bg-[#81613c]",
    "bg-[#3f6b67]",
    "bg-[#7a4a6a]",
  ];

  const hash = name
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return tones[hash % tones.length];
}

function getAvatarLabel(name: string) {
  const [first = "", second = ""] = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  return `${first.charAt(0)}${second.charAt(0) || ""}`.toUpperCase();
}

function formatRelativeTime(date: string) {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diff = timestamp - Date.now();
  const absDiff = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absDiff < hour) {
    return rtf.format(Math.round(diff / minute), "minute");
  }

  if (absDiff < day) {
    return rtf.format(Math.round(diff / hour), "hour");
  }

  if (absDiff < week) {
    return rtf.format(Math.round(diff / day), "day");
  }

  return rtf.format(Math.round(diff / week), "week");
}

function CommentMessage({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = message.length > 220;
  const visibleMessage =
    !shouldTruncate || expanded
      ? message
      : `${message.slice(0, 220).trimEnd()}...`;

  return (
    <div className="space-y-2">
      <p className="whitespace-pre-line text-[13px] leading-[1.52] text-white">
        {visibleMessage}
      </p>
      {shouldTruncate ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="text-[11px] font-medium text-white transition hover:text-white/85"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

function CommentLikeButton({
  commentId,
  initialCount = 0,
}: {
  commentId: ContentId;
  initialCount?: number;
}) {
  const normalizedCommentId = useMemo(() => String(commentId), [commentId]);
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

    setLiked(
      window.localStorage.getItem(getCommentStorageKey(normalizedCommentId)) === "1",
    );

    function onCommentLiked(
      event: Event,
    ) {
      const detail = (
        event as CustomEvent<{
          commentId: string;
          count: number;
          liked: boolean;
        }>
      ).detail;

      if (detail?.commentId === normalizedCommentId) {
        setLiked(Boolean(detail.liked));
        setCount(detail.count);
      }
    }

    window.addEventListener(COMMENT_LIKED_EVENT, onCommentLiked as EventListener);

    return () => {
      window.removeEventListener(COMMENT_LIKED_EVENT, onCommentLiked as EventListener);
    };
  }, [normalizedCommentId]);

  function onToggleLike() {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      const action = liked ? "unlike" : "like";
      const response = await fetch(
        `/api/comments/${encodeURIComponent(normalizedCommentId)}/like`,
        {
          method: liked ? "DELETE" : "POST",
        },
      );

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        likeCount?: number;
        liked?: boolean;
      };
      const nextCount =
        typeof data.likeCount === "number"
          ? data.likeCount
          : liked
            ? Math.max(0, count - 1)
            : count + 1;
      const nextLiked = typeof data.liked === "boolean" ? data.liked : action === "like";

      setLiked(nextLiked);
      setCount(nextCount);

      if (typeof window !== "undefined") {
        if (nextLiked) {
          window.localStorage.setItem(getCommentStorageKey(normalizedCommentId), "1");
        } else {
          window.localStorage.removeItem(getCommentStorageKey(normalizedCommentId));
        }

        window.dispatchEvent(
          new CustomEvent(COMMENT_LIKED_EVENT, {
            detail: {
              commentId: normalizedCommentId,
              count: nextCount,
              liked: nextLiked,
            },
          }),
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onToggleLike}
      disabled={isPending}
      aria-label={liked ? "Unlike comment" : "Like comment"}
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium transition",
        liked ? "text-red-500" : "text-white/42 hover:text-white/75",
      )}
    >
      <Heart className={cn("h-4 w-4", liked ? "fill-current" : "fill-transparent")} />
      <span>{count}</span>
    </button>
  );
}

function CommentThread({
  comments,
  postId,
  rememberedIdentity,
  depth = 0,
}: {
  comments: CommentEntry[];
  postId: ContentId;
  rememberedIdentity?: {
    name: string;
    email: string;
    source: "subscriber" | "commenter";
  } | null;
  depth?: number;
}) {
  return (
    <div className={cn("space-y-4", depth > 0 && "space-y-3 pl-6")}>
      {comments.map((comment) => {
        const replyCount = comment.replies?.length ?? 0;

        return (
          <article key={comment.id} className="pb-1">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
                  hashNameToTone(comment.name),
                )}
                aria-hidden="true"
              >
                {getAvatarLabel(comment.name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[13px] font-semibold leading-5 text-white">
                    {comment.name}
                  </p>
                  {comment.date ? (
                    <span className="text-[11px] font-medium text-white/80">
                      {formatRelativeTime(comment.date)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-0.5">
                  <CommentMessage message={comment.message} />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-medium text-white">
                  <details className="group">
                    <summary className="cursor-pointer list-none transition hover:text-white/85">
                      Reply to comment
                    </summary>
                    <div className="mt-3">
                      <CommentForm
                        postId={postId}
                        parentId={comment.id}
                        replyToName={comment.name}
                        rememberedIdentity={rememberedIdentity}
                        tone="dark"
                        compact
                        layout="sheet"
                      />
                    </div>
                  </details>

                  <CommentLikeButton
                    commentId={comment.id}
                    initialCount={comment.likeCount}
                  />
                </div>

                {replyCount ? (
                  <details className="group mt-3">
                    <summary className="list-none cursor-pointer text-[11px] font-medium text-white transition hover:text-white/85">
                      <span className="group-open:hidden">
                        View replies ({replyCount})
                      </span>
                      <span className="hidden group-open:inline">
                        Hide replies
                      </span>
                    </summary>
                    <div className="mt-3">
                      <CommentThread
                        comments={comment.replies ?? []}
                        postId={postId}
                        rememberedIdentity={rememberedIdentity}
                        depth={depth + 1}
                      />
                    </div>
                  </details>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function CommentsDrawer({
  comments,
  postId,
  rememberedIdentity,
}: {
  comments: CommentEntry[];
  postId: ContentId;
  rememberedIdentity?: {
    name: string;
    email: string;
    source: "subscriber" | "commenter";
  } | null;
}) {
  const totalComments = countComments(comments);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Open comments${totalComments ? ` (${totalComments})` : ""}`}
          className="group inline-flex h-12 items-center gap-2.5 rounded-full border border-[#10131a] bg-[#10131a] px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(6,9,15,0.16)] transition hover:-translate-y-0.5 hover:bg-[#171c25]"
        >
          <MessageCircleMore className="h-4.5 w-4.5 transition group-hover:scale-105" />
          <span>Comments</span>
          <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-white/10 px-1.5 text-[11px] font-semibold text-white">
            {totalComments}
          </span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        overlayClassName="bg-black/10 backdrop-blur-none"
        className="border-white/12 bg-[#222222] text-white"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/8 px-4 pb-3 pt-3">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/16" />
            <div className="text-center">
              <SheetTitle className="text-[17px] font-semibold tracking-normal text-white">
                Comments
              </SheetTitle>
              <SheetDescription className="mt-1 text-[11px] text-white/42">
                {totalComments
                  ? `${totalComments} ${totalComments === 1 ? "comment" : "comments"} on this post`
                  : "Be the first to start the conversation."}
              </SheetDescription>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {comments.length ? (
              <CommentThread
                comments={comments}
                postId={postId}
                rememberedIdentity={rememberedIdentity}
              />
            ) : (
              <div className="py-10 text-center text-[13px] leading-6 text-white">
                No comments yet.
              </div>
            )}
          </div>

          <div className="border-t border-white/8 bg-[#222222] px-4 py-3">
            <CommentForm
              postId={postId}
              rememberedIdentity={rememberedIdentity}
              tone="dark"
              compact
              layout="sheet"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
