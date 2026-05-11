import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Event",
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
    defineField({ name: "eventDate", title: "Event date", type: "datetime" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "description_en", title: "Description (EN)", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "description_th", title: "Description (TH)", type: "array", of: [{ type: "block" }] }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "isUpcoming", title: "Upcoming", type: "boolean", initialValue: false }),
  ],
  preview: { select: { title: "title_en", subtitle: "location" } },
});
