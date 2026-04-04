import { useState } from "react";
import { useClient, type DocumentActionComponent } from "sanity";

import { getSiteSettingsDocumentDefaults } from "@/lib/site-settings-defaults";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function slugKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function ensureArrayKeys(value: unknown, path = "item"): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const ensured = ensureArrayKeys(item, `${path}-${index}`);

      if (!isPlainObject(ensured)) {
        return ensured;
      }

      if ("_key" in ensured && typeof ensured._key === "string" && ensured._key.trim()) {
        return ensured;
      }

      const labelSource =
        (typeof ensured.title === "string" && ensured.title) ||
        (typeof ensured.label === "string" && ensured.label) ||
        (typeof ensured.url === "string" && ensured.url) ||
        `${path}-${index + 1}`;

      return {
        ...ensured,
        _key: `${slugKey(labelSource) || path}-${index + 1}`,
      };
    });
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, ensureArrayKeys(entry, key)]),
    );
  }

  return value;
}

function mergeMissingValues(current: unknown, fallback: unknown): unknown {
  if (Array.isArray(fallback)) {
    if (Array.isArray(current) && current.length > 0) {
      return ensureArrayKeys(current);
    }

    return ensureArrayKeys(fallback);
  }

  if (isPlainObject(fallback)) {
    const currentObject = isPlainObject(current) ? current : {};
    const mergedEntries = Object.entries(fallback).map(([key, value]) => [
      key,
      mergeMissingValues(currentObject[key], value),
    ]);

    const passthroughEntries = Object.entries(currentObject).filter(
      ([key]) => !(key in fallback),
    );

    return Object.fromEntries([...mergedEntries, ...passthroughEntries]);
  }

  if (current === undefined || current === null || current === "") {
    return fallback;
  }

  return current;
}

export const FillSiteSettingsDefaultsAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: "2025-03-01" });
  const [isSyncing, setIsSyncing] = useState(false);

  if (props.type !== "siteSettings") {
    return null;
  }

  return {
    label: isSyncing ? "Filling defaults..." : "Fill missing live defaults",
    disabled: isSyncing,
    onHandle: async () => {
      setIsSyncing(true);

      try {
        const source = (props.draft || props.published || {}) as Record<string, unknown>;
        const merged = ensureArrayKeys(
          mergeMissingValues(source, getSiteSettingsDocumentDefaults()),
        ) as Record<string, unknown>;
        const { _createdAt, _id, _rev, _type, _updatedAt, ...payload } = merged;
        const targetId = props.draft?._id || props.published?._id || props.id;

        await client.patch(targetId).set(payload).commit();
      } finally {
        setIsSyncing(false);
        props.onComplete();
      }
    },
  };
};
