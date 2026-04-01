import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import he from "he";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeHtml(value?: string | null) {
  if (!value) {
    return "";
  }

  return he.decode(value);
}

export function stripHtml(value?: string | null) {
  if (!value) {
    return "";
  }

  return decodeHtml(value).replace(/<[^>]*>/g, "").trim();
}

export function formatDate(value?: string | null, formatString = "MMMM d, yyyy") {
  if (!value) {
    return "";
  }

  return format(new Date(value), formatString);
}

export function absoluteUrl(path = "") {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return new URL(path, baseUrl).toString();
}

export function firstSentence(value?: string | null) {
  const clean = stripHtml(value);
  const [sentence] = clean.split(/(?<=[.!?])\s+/);

  return sentence || clean;
}

export function clampText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export function deriveDisplayNameFromEmail(email?: string | null) {
  if (!email) {
    return "Reader";
  }

  const localPart = email.split("@")[0] || "";
  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 2) {
    return "Reader";
  }

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
