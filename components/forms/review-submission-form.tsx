"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReviewSubmissionForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [rating, setRating] = useState("5");
  const [isPending, startTransition] = useTransition();
  const startedAt = useMemo(() => String(Date.now()), []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { message: string };
      setStatus(data.message);

      if (response.ok) {
        form.reset();
        setRating("5");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="editorial-panel space-y-4 p-5 md:p-6" encType="multipart/form-data">
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-name">Name</Label>
          <Input id="review-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-email">Email</Label>
          <Input id="review-email" name="email" type="email" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-rating">Rating</Label>
        <select
          id="review-rating"
          name="rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="flex h-12 w-full rounded-xl border border-input bg-white px-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Poor</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-message">Your review</Label>
        <Textarea id="review-message" name="message" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-photo">Optional photo</Label>
        <Input id="review-photo" name="photo" type="file" accept="image/*" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Submissions are moderated before they appear publicly.
        </p>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit review"}
        </Button>
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </form>
  );
}
