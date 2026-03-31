import { createImageUrlBuilder } from "@sanity/image-url";
import { createClient } from "next-sanity";

import {
  hasValidSanityConfig,
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/lib/sanity/env";

export function isSanityConfigured() {
  return hasValidSanityConfig();
}

export const sanityClient = isSanityConfigured()
  ? createClient({
      projectId: sanityProjectId!,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

export const sanityWriteClient =
  isSanityConfigured() && process.env.SANITY_API_WRITE_TOKEN
    ? createClient({
        projectId: sanityProjectId!,
        dataset: sanityDataset,
        apiVersion: sanityApiVersion,
        useCdn: false,
        token: process.env.SANITY_API_WRITE_TOKEN,
      })
    : null;

const builder =
  isSanityConfigured() && sanityProjectId
    ? createImageUrlBuilder({
        projectId: sanityProjectId,
        dataset: sanityDataset,
      })
    : null;

export function getSanityImageUrl(source: unknown) {
  if (!builder || !source) {
    return null;
  }

  return builder.image(source).auto("format").fit("max").url();
}
