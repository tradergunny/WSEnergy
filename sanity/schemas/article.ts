import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Article",
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
    defineField({ name: "excerpt_en", title: "Excerpt (EN)", type: "text" }),
    defineField({ name: "excerpt_th", title: "Excerpt (TH)", type: "text" }),
    defineField({
      name: "body_en",
      title: "Body (EN)",
      type: "array",
      of: [{ type: "block" }, { type: "image" }],
    }),
    defineField({
      name: "body_th",
      title: "Body (TH)",
      type: "array",
      of: [{ type: "block" }, { type: "image" }],
    }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["safety", "compliance", "install", "product-news"],
      },
    }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
  ],
  preview: {
    select: { title: "title_en", subtitle: "category", media: "heroImage" },
  },
});
