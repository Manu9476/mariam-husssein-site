import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "@/sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export default defineConfig({
  name: "default",
  title: "Mariam Husssein Studio",
  basePath: "/studio",
  projectId: projectId || "",
  dataset: dataset || "production",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
