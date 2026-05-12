/**
 * Sanity environment variables.
 * Read from .env.local (not committed). The project ID and dataset are
 * client-safe; the read token is server-only.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing env var: ${name}. Add it to WSEnergy/.env.local`,
    );
  }
  return value;
}

export const projectId = required(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);

export const dataset = required(
  "NEXT_PUBLIC_SANITY_DATASET",
  process.env.NEXT_PUBLIC_SANITY_DATASET,
);

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

/** Server-only — never expose to the client bundle. */
export const readToken = process.env.SANITY_API_READ_TOKEN;

/** Server-only — used for writing RFQ submissions to Sanity. */
export const writeToken = process.env.SANITY_API_WRITE_TOKEN;
