/**
 * Sanity Studio mounted at /studio.
 * The catch-all [[...tool]] segment lets Studio's internal router handle
 * sub-routes like /studio/desk/product;<id>.
 */
"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
