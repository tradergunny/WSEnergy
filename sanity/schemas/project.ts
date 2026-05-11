import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project (case study)",
  type: "document",
  fields: [
    defineField({ name: "title_en", title: "Title (EN)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title_th", title: "Title (TH)", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title_en", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "customer", title: "Customer", type: "string" }),
    defineField({
      name: "sector",
      title: "Sector",
      type: "string",
      options: {
        list: [
          "Factory",
          "Warehouse",
          "School",
          "Government",
          "Solar Farm",
          "Residential",
        ],
      },
    }),
    defineField({ name: "capacity", title: "Capacity (display, e.g. '1.2 MW')", type: "string" }),
    defineField({ name: "capacityKw", title: "Capacity (kW, for sorting)", type: "number" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({
      name: "productsUsed",
      title: "Products used",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "challenge_en", title: "Challenge (EN)", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "challenge_th", title: "Challenge (TH)", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "solution_en", title: "Solution (EN)", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "solution_th", title: "Solution (TH)", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "results_en", title: "Results (EN)", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "results_th", title: "Results (TH)", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "testimonial_en", title: "Testimonial (EN)", type: "text" }),
    defineField({ name: "testimonial_th", title: "Testimonial (TH)", type: "text" }),
    defineField({
      name: "featured",
      title: "Featured on homepage",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title_en", subtitle: "customer", media: "heroImage" },
  },
});
