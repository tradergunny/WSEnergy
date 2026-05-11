import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
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
    defineField({
      name: "parent",
      title: "Parent category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Top-level: 'safety' or 'products'.",
    }),
    defineField({ name: "description_en", title: "Description (EN)", type: "text" }),
    defineField({ name: "description_th", title: "Description (TH)", type: "text" }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true } }),
    defineField({ name: "orderRank", title: "Order rank", type: "number" }),
  ],
  preview: { select: { title: "title_en", subtitle: "slug.current", media: "heroImage" } },
});
