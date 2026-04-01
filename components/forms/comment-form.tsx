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
  compact = false,
}: {
  postId: ContentId;
  parentId?: ContentId;
  replyToName?: string;
  rememberedIdentity?: {
    name: string;
    email: string;
    source: "subscriber" | "commenter";
  } | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState(() => buildInitialValues(rememberedIdentity));
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const startedAt = useMemo(() => String(Date.now()), []);
  const formId = useId();

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
      className={`editorial-panel space-y-4 ${compact ? "p-4 md:p-5" : "p-5 md:p-6"}`}
    >
      {replyToName ? (
        <p className="text-sm text-muted-foreground">
          Replying to {replyToName}.
        </p>
      ) : null}
      {rememberedIdentity ? (
        <p className="text-sm text-muted-foreground">
          Commenting as {rememberedIdentity.name}.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-comment-name`}>Name</Label>
            <Input
              id={`${formId}-comment-name`}
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-comment-email`}>Email</Label>
            <Input
              id={`${formId}-comment-email`}
              type="email"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              required
            />
          </div>
        </div>
      )}
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
      <div className="space-y-2">
        <Label htmlFor={`${formId}-comment-message`}>Comment</Label>
        <Textarea
          id={`${formId}-comment-message`}
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {parentId
            ? "Replies appear publicly right away, so keep them kind and thoughtful."
            : "Comments appear publicly right away, so keep them kind and thoughtful."}
        </p>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : parentId ? "Post reply" : "Post comment"}
        </Button>
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </form>
  );
}
