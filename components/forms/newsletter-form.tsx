"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({
  placeholder,
  buttonLabel,
}: {
  placeholder: string;
  buttonLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [subscriberEmail, setSubscriberEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const startedAt = useMemo(() => String(Date.now()), []);

  useEffect(() => {
    const match = document.cookie.match(
      /(?:^|;\s*)mh_newsletter_subscriber=([^;]+)/,
    );

    if (match?.[1]) {
      setSubscriberEmail(decodeURIComponent(match[1]));
    }
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    startTransition(async () => {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, website, startedAt }),
      });

      const data = (await response.json()) as {
        message: string;
        subscriberEmail?: string | null;
      };
      setStatus(data.message);

      if (response.ok) {
        setEmail("");
        setWebsite("");
        setSubscriberEmail(data.subscriberEmail ?? email.trim().toLowerCase());
        router.push("/newsletter");
        router.refresh();
      }
    });
  }

  if (subscriberEmail) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="eyebrow">You are subscribed</p>
          <p className="mt-2 text-[1rem] leading-8 text-foreground/85">
            Signed in on this browser as {subscriberEmail}. Open the newsletter page to see the latest published notes.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/newsletter">
            {pathname === "/newsletter" ? "Open published notes" : "Go to newsletter page"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="hidden">
        <Input
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          aria-label="Email address"
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : buttonLabel}
        </Button>
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </form>
  );
}
