"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContentId } from "@/types/content";

const initialValues = {
  name: "",
  email: "",
  message: "",
};

export function CommentForm({
  postId,
}: {
  postId: ContentId;
}) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const startedAt = useMemo(() => String(Date.now()), []);

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
          website: "",
          startedAt,
        }),
      });

      const data = (await response.json()) as { message: string };
      setStatus(data.message);

      if (response.ok) {
        setValues(initialValues);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="editorial-panel space-y-4 p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="comment-name">Name</Label>
          <Input
            id="comment-name"
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comment-email">Email</Label>
          <Input
            id="comment-email"
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            required
          />
        </div>
      </div>
      <div className="hidden">
        <Label htmlFor="comment-website">Website</Label>
        <Input
          id="comment-website"
          tabIndex={-1}
          autoComplete="off"
          value=""
          onChange={() => undefined}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment-message">Comment</Label>
        <Textarea
          id="comment-message"
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Comments are moderated before they appear publicly.
        </p>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Post comment"}
        </Button>
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </form>
  );
}
