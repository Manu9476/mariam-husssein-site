import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { sanityDataset, sanityProjectId } from "@/lib/sanity/env";
import { FillSiteSettingsDefaultsAction } from "@/sanity/document-actions/fill-site-settings-defaults-action";
import { schemaTypes } from "@/sanity/schemaTypes";
import { reportsTool } from "@/sanity/tools/reports-tool";

export default defineConfig({
  name: "default",
  title: "Mariam Husssein Studio",
  basePath: "/studio",
  projectId: sanityProjectId || "demo-project",
  dataset: sanityDataset,
  plugins: [structureTool()],
  tools: (prev) => [...prev, reportsTool],
  document: {
    actions: (prev, context) =>
      context.schemaType === "siteSettings"
        ? [FillSiteSettingsDefaultsAction, ...prev]
        : prev,
  },
  schema: {
    types: schemaTypes,
  },
});
