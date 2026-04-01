import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { sanityDataset, sanityProjectId } from "@/lib/sanity/env";
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
  schema: {
    types: schemaTypes,
  },
});
