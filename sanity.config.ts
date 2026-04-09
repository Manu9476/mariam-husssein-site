import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { sanityDataset, sanityProjectId } from "@/lib/sanity/env";
import { FillSiteSettingsDefaultsAction } from "@/sanity/document-actions/fill-site-settings-defaults-action";
import {
  createCommentSafeDeleteAction,
  createCommentSafeUnpublishAction,
} from "@/sanity/document-actions/post-reference-safe-actions";
import { schemaTypes } from "@/sanity/schemaTypes";
import { reportsTool } from "@/sanity/tools/reports-tool";

export default defineConfig({
  name: "default",
  title: "Mariam Husssein Studio",
  basePath: "/studio",
  projectId: sanityProjectId || "demo-project",
  dataset: sanityDataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items(
            S.documentTypeListItems().filter(
              (item) => item.getId() !== "siteVisit",
            ),
          ),
    }),
  ],
  tools: (prev) => [...prev, reportsTool],
  document: {
    actions: (prev, context) => {
      let actions = prev;

      if (context.schemaType === "siteSettings") {
        actions = [FillSiteSettingsDefaultsAction, ...actions];
      }

      if (context.schemaType === "post") {
        actions = actions.map((action) => {
          if (action.action === "delete") {
            return createCommentSafeDeleteAction(action);
          }

          if (action.action === "unpublish") {
            return createCommentSafeUnpublishAction(action);
          }

          return action;
        });
      }

      return actions;
    },
  },
  schema: {
    types: schemaTypes,
  },
});
