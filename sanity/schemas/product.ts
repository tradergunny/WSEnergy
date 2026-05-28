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
      name: "highlights",
      title: "Highlights (\"Why EPCs spec this product\")",
      description:
        "Up to 4 icon-led cards shown under the product header. Each card needs an icon (curated set), a short title, an optional mono credential line (cert codes), and a 1–2 line body. Section hides if empty.",
      type: "array",
      validation: (r) => r.max(4),
      of: [
        {
          type: "object",
          fields: [
            {
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Shield check — bankability / certified", value: "shield-check" },
                  { title: "Bolt off — rapid shutdown / safety", value: "bolt-off" },
                  { title: "Plug connected — grid tie / interconnection", value: "plug-connected" },
                  { title: "Certificate — compliance", value: "certificate" },
                  { title: "Gauge — performance / efficiency", value: "gauge" },
                  { title: "Bolt — power", value: "bolt" },
                  { title: "Sun — solar yield", value: "sun" },
                  { title: "Battery — storage", value: "battery" },
                  { title: "Tools — installation", value: "tools" },
                  { title: "Shield bolt — surge protection", value: "shield-bolt" },
                  { title: "Thermometer — thermal", value: "thermometer" },
                  { title: "World — international standards", value: "world" },
                  { title: "Clock — warranty / lifetime", value: "clock" },
                  { title: "Cube — modular / component", value: "cube" },
                  { title: "Cpu — smart / IoT", value: "cpu" },
                  { title: "Wifi — connectivity", value: "wifi" },
                ],
              },
              initialValue: "shield-check",
              validation: (r) => r.required(),
            },
            {
              name: "title_en",
              title: "Title (EN)",
              type: "string",
              validation: (r) => r.required(),
            },
            { name: "title_th", title: "Title (TH)", type: "string" },
            {
              name: "credential_en",
              title: "Credential line (EN, mono)",
              type: "string",
              description:
                "Small mono caption under the title — e.g. 'TIS · IEC 62109-1/2 · CE'. Keep short.",
            },
            { name: "credential_th", title: "Credential line (TH, mono)", type: "string" },
            {
              name: "body_en",
              title: "Body (EN)",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            },
            { name: "body_th", title: "Body (TH)", type: "text", rows: 3 },
          ],
          preview: {
            select: { title: "title_en", credential: "credential_en", icon: "icon" },
            prepare({ title, credential, icon }) {
              return {
                title: title ?? "(untitled highlight)",
                subtitle: `[${icon ?? "no-icon"}] ${credential ?? ""}`,
              };
            },
          },
        },
      ],
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
