import { setOptions, importLibrary, type LibraryMap } from "@googlemaps/js-api-loader";

/**
 * Single entry point for loading Google Maps JS API libraries on the client.
 *
 * Powers the Solar Rooftop Estimator's map-draw roof input (ROADMAP feature 3).
 * Uses the loader's functional API (`setOptions` + `importLibrary`); the older
 * `new Loader()` class API is deprecated upstream.
 *
 * The key is a NEXT_PUBLIC_* var and is therefore public — it is restricted by
 * HTTP referrer in the Google Cloud console, not kept secret. See ADR 0001.
 */
let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set — add it to .env.local (ROADMAP feature 3, Step 1).",
    );
  }
  // region biases Geocoding/Places results toward Thailand, our only market.
  setOptions({ key, v: "weekly", region: "TH" });
  configured = true;
}

/**
 * Lazily configure the loader and import a single Maps library, e.g.
 * `loadMapsLibrary("maps")`, `loadMapsLibrary("drawing")`,
 * `loadMapsLibrary("geometry")`, `loadMapsLibrary("places")`.
 *
 * Client-only: the returned promise touches `window`, so call it inside an
 * effect / event handler, never during render or on the server.
 */
export function loadMapsLibrary<K extends keyof LibraryMap>(
  name: K,
): Promise<LibraryMap[K]> {
  ensureConfigured();
  return importLibrary(name);
}
