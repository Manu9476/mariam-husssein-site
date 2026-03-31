import { createImageUrlBuilder } from "@sanity/image-url";
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-03-01";

export function isSanityConfigured() {
  return Boolean(projectId && dataset);
}

export const sanityClient = isSanityConfigured()
  ? createClient({
      projectId: projectId!,
      dataset: dataset!,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

export const sanityWriteClient =
  isSanityConfigured() && process.env.SANITY_API_WRITE_TOKEN
    ? createClient({
        projectId: projectId!,
        dataset: dataset!,
        apiVersion,
        useCdn: false,
        token: process.env.SANITY_API_WRITE_TOKEN,
      })
    : null;

const builder =
  isSanityConfigured() && projectId && dataset
    ? createImageUrlBuilder({
        projectId,
        dataset,
      })
    : null;

export function getSanityImageUrl(source: unknown) {
  if (!builder || !source) {
    return null;
  }

  return builder.image(source).auto("format").fit("max").url();
}
