"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const VISITOR_STORAGE_KEY = "mh-visitor-id";
const VISIT_DEDUPE_PREFIX = "mh-visit-dedupe";
const VISIT_DEDUPE_WINDOW_MS = 30_000;

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `mh-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function getOrCreateVisitorId() {
  const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const nextId = createVisitorId();
  window.localStorage.setItem(VISITOR_STORAGE_KEY, nextId);
  return nextId;
}

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !pathname || pathname.startsWith("/studio")) {
      return;
    }

    const visitorId = getOrCreateVisitorId();
    const dedupeKey = `${VISIT_DEDUPE_PREFIX}:${pathname}`;
    const now = Date.now();
    const previous = Number(window.sessionStorage.getItem(dedupeKey) || 0);

    if (previous && now - previous < VISIT_DEDUPE_WINDOW_MS) {
      return;
    }

    window.sessionStorage.setItem(dedupeKey, String(now));

    const payload = JSON.stringify({
      visitorId,
      path: pathname,
      referrer: document.referrer || undefined,
    });

    const endpoint = "/api/analytics/visit";
    const body = new Blob([payload], { type: "application/json" });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Quietly ignore analytics failures so they never affect the reader.
    });
  }, [pathname]);

  return null;
}
