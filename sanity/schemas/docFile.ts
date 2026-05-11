import { defineField, defineType } from "sanity";

/**
 * BRIEF §10.5 calls this 'document', but that's a reserved built-in type kind
 * in Sanity, so the schema name is 'docFile' (display title still "Document").
 * Update any references that point at this.
 */
export const docFile = defineType({
  name: "docFile",
  title: "Document (PDF / file asset)",
  type: "document",
  fields: [
    defineField({ name: "title_en", title: "Title (EN)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title_th", title: "Title (TH)", type: "string" }),
    defineField({
      name: "documentType",
      title: "Document type",
      type: "string",
      options: {
        list: ["datasheet", "manual", "diagram", "authorization", "certification"],
      },
    }),
    defineField({ name: "file", title: "File", type: "file" }),
    defineField({ name: "version", title: "Version", type: "string" }),
    defineField({
      name: "fileSize",
      title: "File size (display, e.g. 'PDF · 1.2 MB · v2.4')",
      type: "string",
    }),
    defineField({
      name: "relatedProducts",
      title: "Related products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
  ],
  preview: { select: { title: "title_en", subtitle: "documentType" } },
});
