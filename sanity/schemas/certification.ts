import { defineField, defineType } from "sanity";

export const certification = defineType({
  name: "certification",
  title: "Certification",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "description_en", title: "Description (EN)", type: "text" }),
    defineField({ name: "description_th", title: "Description (TH)", type: "text" }),
    defineField({
      name: "document",
      title: "Document",
      type: "reference",
      to: [{ type: "docFile" }],
    }),
    defineField({
      name: "showOnHomepage",
      title: "Show on homepage",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: { select: { title: "name", media: "logo" } },
});
