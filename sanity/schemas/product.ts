import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title (model name)",
      type: "string",
      description: "e.g. SUN2000-15KTL-M5",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      description: "Shown in mono font on the site.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
    }),
    defineField({
      name: "authorized",
      title: "Authorized distributor for this product",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "exclusive",
      title: "Exclusive in Thailand",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "safetyCritical",
      title: "Safety-critical",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "shortDescription_en",
      title: "Short description (EN)",
      type: "string",
    }),
    defineField({
      name: "shortDescription_th",
      title: "Short description (TH)",
      type: "string",
    }),
    defineField({
      name: "overview_en",
      title: "Overview (EN)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "overview_th",
      title: "Overview (TH)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "specs",
      title: "Specs",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label_en", title: "Label (EN)", type: "string" },
            { name: "label_th", title: "Label (TH)", type: "string" },
            { name: "value", title: "Value (mono)", type: "string" },
            {
              name: "group",
              title: "Group",
              type: "string",
              description:
                "Which tab this row appears in on the product header.",
              options: {
                list: [
                  { title: "Electrical", value: "electrical" },
                  { title: "Mechanical", value: "mechanical" },
                  { title: "Environment", value: "environment" },
                  { title: "Compliance", value: "compliance" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "electrical",
            },
          ],
          preview: {
            select: { label: "label_en", value: "value", group: "group" },
            prepare({ label, value, group }) {
              return {
                title: label,
                subtitle: `${group ? `[${group}] ` : ""}${value ?? ""}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "compliance",
      title: "Compliance",
      type: "array",
      of: [{ type: "string" }],
      description: "e.g. ['IEC 60947-3', 'TIS']",
    }),
    defineField({
      name: "datasheet",
      title: "Datasheet",
      type: "reference",
      to: [{ type: "docFile" }],
    }),
    defineField({
      name: "wiringDiagram",
      title: "Wiring diagram",
      type: "reference",
      to: [{ type: "docFile" }],
    }),
    defineField({
      name: "installManual",
      title: "Install manual",
      type: "reference",
      to: [{ type: "docFile" }],
    }),
    defineField({
      name: "pairsWellWith",
      title: "Pairs well with",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "orderRank",
      title: "Order rank",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "sku", media: "gallery.0" },
  },
});
