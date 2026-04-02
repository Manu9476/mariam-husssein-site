"use client";

import { MessageCircleMore } from "lucide-react";

import { CommentForm } from "@/components/forms/comment-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDate } from "@/lib/utils";
import type { CommentEntry, ContentId } from "@/types/content";

function countComments(entries: CommentEntry[]): number {
  return entries.reduce(
    (total, entry) => total + 1 + countComments(entry.replies ?? []),
    0,
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
    <div className="space-y-4">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className="space-y-3 rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4"
        >
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            <span>{comment.name}</span>
            {comment.date ? <span>{formatDate(comment.date)}</span> : null}
            {depth ? <span>Reply</span> : null}
          </div>
          <p className="text-[0.98rem] leading-7 text-white/88">{comment.message}</p>
          <details className="pt-1">
            <summary className="cursor-pointer list-none text-sm font-semibold text-[#d8c4ff] transition hover:text-white">
              Reply
            </summary>
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                replyToName={comment.name}
                rememberedIdentity={rememberedIdentity}
                tone="dark"
                minimal
                compact
              />
            </div>
          </details>
          {comment.replies?.length ? (
            <div className="space-y-4 border-l border-white/10 pl-4">
              <CommentThread
                comments={comment.replies}
                postId={postId}
                rememberedIdentity={rememberedIdentity}
                depth={depth + 1}
              />
            </div>
          ) : null}
        </article>
      ))}
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
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={`Open comments${totalComments ? ` (${totalComments})` : ""}`}
            className="group inline-flex h-12 items-center gap-2.5 rounded-full border border-border/80 bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            <MessageCircleMore className="h-4.5 w-4.5 transition group-hover:scale-105" />
            <span>Comments</span>
            <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
              {totalComments}
            </span>
          </button>
        </SheetTrigger>
        <SheetContent className="max-w-[28rem] border-l border-white/10 bg-[#0d1118] p-0 text-white sm:max-w-md">
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-white/10 px-6 py-5 pr-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Conversation
              </p>
              <SheetTitle className="text-[2.05rem] font-medium leading-[0.95] tracking-[-0.04em] text-white">
                Comments
              </SheetTitle>
              <SheetDescription className="text-white/60">
                {totalComments
                  ? `${totalComments} public ${totalComments === 1 ? "comment" : "comments"} and replies on this post.`
                  : "No comments yet. Start the conversation here."}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-5">
                <CommentForm
                  postId={postId}
                  rememberedIdentity={rememberedIdentity}
                  tone="dark"
                  minimal
                />

                {comments.length ? (
                  <CommentThread
                    comments={comments}
                    postId={postId}
                    rememberedIdentity={rememberedIdentity}
                  />
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-6 text-sm leading-7 text-white/58">
                    There are no public comments on this post yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
