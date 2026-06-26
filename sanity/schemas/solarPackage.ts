import { defineField, defineType } from "sanity";

/**
 * A purchasable system tier surfaced by the Solar Rooftop Estimator
 * (ROADMAP feature 3). The estimator computes a recommended kWp from the
 * user's bill + roof, then SNAPS it to the nearest matching package — matched
 * by `phase` and `segment` — and shows that package's price as "from ฿X".
 *
 * Prices are indicative ballparks, not quotes. Employees edit them here in
 * Studio with no deploy (business data lives in Sanity; methodology constants
 * live in lib/estimator/constants.ts — see ADR 0002).
 */
export const solarPackage = defineType({
  name: "solarPackage",
  title: "Solar Package",
  type: "document",
  fields: [
    defineField({
      name: "sizeKw",
      title: "System size (kWp)",
      type: "number",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "phase",
      title: "Electrical phase",
      type: "string",
      options: {
        list: [
          { title: "Single-phase (1)", value: "single" },
          { title: "Three-phase (3)", value: "three" },
          { title: "Either", value: "both" },
        ],
        layout: "radio",
      },
      initialValue: "single",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "segment",
      title: "Customer segment",
      type: "string",
      options: {
        list: [
          { title: "Residential", value: "residential" },
          { title: "Business", value: "business" },
          { title: "Either", value: "both" },
        ],
        layout: "radio",
      },
      initialValue: "residential",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "price",
      title: "Indicative all-in price (THB)",
      type: "number",
      description: "Turn-key installed price shown as “from ฿X”. Ballpark, not a quote.",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "panelCount",
      title: "Panel count",
      type: "number",
      description: "Informational — approximate number of panels in this kit.",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "includedComponents",
      title: "What's included",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        'Free-text line items (e.g. "9× 590W mono panels", "5kW hybrid inverter").',
    }),
    defineField({
      name: "active",
      title: "Active (show in estimator)",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "orderRank",
      title: "Order rank",
      type: "number",
      description: "Lower numbers appear first within the same size.",
      initialValue: 100,
    }),
  ],
  preview: {
    select: {
      sizeKw: "sizeKw",
      phase: "phase",
      segment: "segment",
      price: "price",
      active: "active",
    },
    prepare({ sizeKw, phase, segment, price, active }) {
      const phaseLabel =
        phase === "single" ? "1-phase" : phase === "three" ? "3-phase" : "1/3-phase";
      const priceLabel =
        typeof price === "number" ? `฿${price.toLocaleString("en-US")}` : "no price";
      const seg = segment ? segment[0].toUpperCase() + segment.slice(1) : "";
      return {
        title: `${sizeKw ?? "?"} kW · ${phaseLabel}`,
        subtitle: [seg, priceLabel, active === false ? "(inactive)" : null]
          .filter(Boolean)
          .join(" • "),
      };
    },
  },
  orderings: [
    {
      title: "Size (small → large)",
      name: "sizeAsc",
      by: [{ field: "sizeKw", direction: "asc" }],
    },
    {
      title: "Order rank",
      name: "orderRankAsc",
      by: [{ field: "orderRank", direction: "asc" }],
    },
  ],
});
