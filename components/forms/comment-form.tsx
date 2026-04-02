"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContentId } from "@/types/content";

const initialValues = {
  name: "",
  email: "",
  message: "",
  website: "",
};

function buildInitialValues(
  rememberedIdentity?: {
    name: string;
    email: string;
  } | null,
) {
  return {
    name: rememberedIdentity?.name || "",
    email: rememberedIdentity?.email || "",
    message: "",
    website: "",
  };
}

export function CommentForm({
  postId,
  parentId,
  replyToName,
  rememberedIdentity,
  tone = "light",
  minimal = false,
  compact = false,
  layout = "default",
}: {
  postId: ContentId;
  parentId?: ContentId;
  replyToName?: string;
  rememberedIdentity?: {
    name: string;
    email: string;
    source: "subscriber" | "commenter";
  } | null;
  tone?: "light" | "dark";
  minimal?: boolean;
  compact?: boolean;
  layout?: "default" | "sheet";
}) {
  const router = useRouter();
  const [values, setValues] = useState(() => buildInitialValues(rememberedIdentity));
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const startedAt = useMemo(() => String(Date.now()), []);
  const formId = useId();
  const isDark = tone === "dark";
  const isSheet = layout === "sheet";

  function updateValue(key: keyof typeof initialValues, value: string) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    startTransition(async () => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          postId: String(postId),
          ...(parentId ? { parentId: String(parentId) } : {}),
          startedAt,
        }),
      });

      const data = (await response.json()) as { message: string };
      setStatus(data.message);

      if (response.ok) {
        setValues(buildInitialValues(rememberedIdentity));
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        isSheet
          ? "space-y-3"
          : isDark
          ? `space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] ${
              compact ? "p-4 md:p-5" : "p-5 md:p-6"
            }`
          : `editorial-panel space-y-4 ${compact ? "p-4 md:p-5" : "p-5 md:p-6"}`
      }
    >
      {replyToName ? (
        <p
          className={
            isSheet
              ? "text-[11px] font-medium text-white/42"
              : isDark
                ? "text-sm text-white/60"
                : "text-sm text-muted-foreground"
          }
        >
          Replying to {replyToName}.
        </p>
      ) : null}
      {!rememberedIdentity ? (
        <div className={isSheet ? "grid gap-2 sm:grid-cols-2" : "grid gap-4 md:grid-cols-2"}>
          <div className="space-y-2">
            <Label
              htmlFor={`${formId}-comment-name`}
              className={
                isSheet ? "sr-only" : isDark ? "text-white/80" : undefined
              }
            >
              Name
            </Label>
            <Input
              id={`${formId}-comment-name`}
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              className={
                isSheet
                  ? "h-10 rounded-2xl border-white/8 bg-white/[0.04] px-4 text-[13px] text-white shadow-none placeholder:text-white/28 focus-visible:ring-1 focus-visible:ring-white/20"
                  : isDark
                    ? "border-white/10 bg-black/20 text-white placeholder:text-white/35"
                    : undefined
              }
              placeholder="Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={`${formId}-comment-email`}
              className={
                isSheet ? "sr-only" : isDark ? "text-white/80" : undefined
              }
            >
              Email
            </Label>
            <Input
              id={`${formId}-comment-email`}
              type="email"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              className={
                isSheet
                  ? "h-10 rounded-2xl border-white/8 bg-white/[0.04] px-4 text-[13px] text-white shadow-none placeholder:text-white/28 focus-visible:ring-1 focus-visible:ring-white/20"
                  : isDark
                    ? "border-white/10 bg-black/20 text-white placeholder:text-white/35"
                    : undefined
              }
              placeholder="Email"
              required
            />
          </div>
        </div>
      ) : null}
      <div className="hidden">
        <Label htmlFor={`${formId}-comment-website`}>Website</Label>
        <Input
          id={`${formId}-comment-website`}
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => updateValue("website", event.target.value)}
        />
      </div>
      {isSheet ? (
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`${formId}-comment-message`} className="sr-only">
              Comment
            </Label>
            <Textarea
              id={`${formId}-comment-message`}
              rows={1}
              value={values.message}
              onChange={(event) => updateValue("message", event.target.value)}
              placeholder={parentId ? "Add a reply..." : "Add a comment..."}
              className="min-h-[46px] rounded-[1.25rem] border-white/8 bg-white/[0.04] px-4 py-3 text-[13px] leading-[1.45] text-white shadow-none placeholder:text-white/28 focus-visible:ring-1 focus-visible:ring-white/20"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="h-[46px] rounded-full bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#171717] shadow-none hover:bg-white/90"
          >
            {isPending ? "Sending" : parentId ? "Reply" : "Post"}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label
              htmlFor={`${formId}-comment-message`}
              className={
                minimal
                  ? "sr-only"
                  : isDark
                    ? "text-white/80"
                    : undefined
              }
            >
              Comment
            </Label>
            <Textarea
              id={`${formId}-comment-message`}
              value={values.message}
              onChange={(event) => updateValue("message", event.target.value)}
              placeholder={parentId ? "Write your reply..." : "Write your comment..."}
              className={
                isDark
                  ? "border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  : undefined
              }
              required
            />
          </div>
          <div
            className={
              minimal
                ? "flex justify-end"
                : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            }
          >
            {!minimal ? (
              <p className={isDark ? "text-sm text-white/55" : "text-sm text-muted-foreground"}>
                {parentId
                  ? "Replies appear publicly right away, so keep them kind and thoughtful."
                  : "Comments appear publicly right away, so keep them kind and thoughtful."}
              </p>
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : parentId ? "Post reply" : "Post comment"}
            </Button>
          </div>
        </>
      )}
      {status ? (
        <p
          className={
            isSheet
              ? "text-[11px] text-white/46"
              : isDark
                ? "text-sm text-white/60"
                : "text-sm text-muted-foreground"
          }
        >
          {status}
        </p>
      ) : null}
    </form>
  );
}
