const PROJECT_ID_PATTERN = /^[a-z0-9-]+$/;

function sanitizeProjectId(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized || !PROJECT_ID_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

function sanitizeDataset(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return normalized;
}

export const sanityProjectId = sanitizeProjectId(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);

export const sanityDataset =
  sanitizeDataset(process.env.NEXT_PUBLIC_SANITY_DATASET) || "production";

export const sanityApiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2025-03-01";

export function hasValidSanityConfig() {
  return Boolean(sanityProjectId && sanityDataset);
}
