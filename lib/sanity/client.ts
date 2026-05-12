import { createClient } from "next-sanity";
import { createImageUrlBuilder as imageUrlBuilder } from "@sanity/image-url";
import { apiVersion, dataset, projectId, readToken, writeToken } from "./env";

/**
 * Public client — CDN-cached, used for read-only GROQ queries from server components.
 * BRIEF §9.1 / §14.4.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

/**
 * Server-only client with a read token. Use this for previews or any fetch
 * that should bypass the CDN. Do not import from a client component.
 */
export const sanityServerClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken,
  perspective: "published",
});

/**
 * Write client — used server-side for creating documents (e.g. RFQ submissions).
 * Requires SANITY_API_WRITE_TOKEN in .env.local.
 */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: writeToken,
});

const builder = imageUrlBuilder({ projectId, dataset });
export const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source);
