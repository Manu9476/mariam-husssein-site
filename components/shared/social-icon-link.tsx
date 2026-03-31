import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  Globe,
  Instagram,
  Linkedin,
  Music2,
  Pin,
  Youtube,
} from "lucide-react";

import { cn } from "@/lib/utils";

function pickSocialIcon(label: string, url: string): LucideIcon {
  const value = `${label} ${url}`.toLowerCase();

  if (value.includes("instagram")) {
    return Instagram;
  }

  if (value.includes("youtube")) {
    return Youtube;
  }

  if (value.includes("linkedin")) {
    return Linkedin;
  }

  if (value.includes("pinterest")) {
    return Pin;
  }

  if (value.includes("tiktok") || value.includes("spotify")) {
    return Music2;
  }

  if (value.includes("x.com") || value.includes("twitter") || label.toLowerCase() === "x") {
    return AtSign;
  }

  return Globe;
}

export function SocialIconLink({
  label,
  url,
  className,
  iconClassName,
}: {
  label: string;
  url: string;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = pickSocialIcon(label, url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-[#1B4332] transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground",
        className,
      )}
    >
      <Icon className={cn("h-4 w-4", iconClassName)} />
    </a>
  );
}
