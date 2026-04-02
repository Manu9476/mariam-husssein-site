"use client";

import { Heart, MessageCircleMore } from "lucide-react";

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

function countComments(entries: CommentEntry[]): number {
  return entries.reduce(
    (total, entry) => total + 1 + countComments(entry.replies ?? []),
    0,
  );
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
    <div className={cn("space-y-4", depth > 0 && "space-y-3")}>
      {comments.map((comment) => {
        const replyCount = comment.replies?.length ?? 0;

        return (
          <article
            key={comment.id}
            className={cn(
              "border-b border-white/8 pb-4",
              depth > 0 && "border-b-white/6 pb-3",
            )}
          >
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
                    <span className="text-[11px] font-medium text-white/36">
                      {formatRelativeTime(comment.date)}
                    </span>
                  ) : null}
                </div>

                <p className="mt-0.5 whitespace-pre-line text-[13px] leading-[1.45] text-white/92">
                  {comment.message}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-medium text-white/42">
                  <details>
                    <summary className="cursor-pointer list-none transition hover:text-white">
                      Reply
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
                </div>

                {replyCount ? (
                  <details className="mt-3">
                    <summary className="list-none cursor-pointer text-[11px] font-medium text-white/38 transition hover:text-white">
                      <span className="mr-2 inline-block h-px w-7 align-middle bg-white/16" />
                      View {replyCount} more {replyCount === 1 ? "reply" : "replies"}
                    </summary>
                    <div className="mt-3 border-l border-white/8 pl-4">
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

              <button
                type="button"
                aria-label="Like comment"
                className="mt-0.5 shrink-0 text-white/24 transition hover:text-white/55"
              >
                <Heart className="h-4 w-4" />
              </button>
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
        overlayClassName="bg-black/16"
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
              <div className="py-10 text-center text-[13px] leading-6 text-white/45">
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
