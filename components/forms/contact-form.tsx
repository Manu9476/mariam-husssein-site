"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export function ContactForm() {
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
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
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            required
          />
        </div>
      </div>
      <div className="hidden">
        <Label htmlFor="contact-website">Website</Label>
        <Input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => updateValue("website", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={values.subject}
          onChange={(event) => updateValue("subject", event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send message"}
        </Button>
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </form>
  );
}
