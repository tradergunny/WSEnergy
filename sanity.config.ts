import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./lib/sanity/env";

/**
 * Sanity Studio config — mounted at /studio in the Next.js app.
 * Run dev server: npm run dev → http://localhost:3000/studio
 */
void apiVersion;
export default defineConfig({
  name: "ws-energy",
  title: "WS Energy",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
