/**
 * Shared (server-safe) mapping from a Sanity category slug to a schematic
 * drawing variant. Lives outside ProductSchematic.tsx because that module is
 * "use client" — server components (ProductDetail) must be able to call this
 * without pulling the client boundary in.
 */

export type SchematicVariant =
  | "inverter"
  | "battery"
  | "switch"
  | "optimizer"
  | "charger"
  | "generic";

/** Map a Sanity category slug onto a drawing variant. */
export function schematicVariantForCategory(
  slug?: string | null,
): SchematicVariant {
  const s = (slug ?? "").toLowerCase();
  if (s.includes("inverter")) return "inverter";
  if (s.includes("battery") || s.includes("storage")) return "battery";
  if (s.includes("shutdown") || s.includes("switch") || s.includes("safety"))
    return "switch";
  if (s.includes("optimizer")) return "optimizer";
  if (s.includes("charger") || s.startsWith("ev")) return "charger";
  return "generic";
}
