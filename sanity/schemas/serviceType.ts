import { defineField, defineType } from "sanity";

export const serviceType = defineType({
  name: "serviceType",
  title: "Service Type",
  type: "document",
  description:
    "Taxonomy for installer services (rooftop solar, battery storage, etc.). Referenced by Installer.",
  fields: [
    defineField({
      name: "title_en",
      title: "Title (EN)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title_th",
      title: "Title (TH)",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title_en", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon name",
      type: "string",
      description:
        'Optional lucide-react icon name (e.g. "sun", "battery", "plug-zap"). Falls back to a default if blank.',
    }),
    defineField({
      name: "orderRank",
      title: "Order rank",
      type: "number",
      description: "Lower numbers appear first in filter lists.",
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: "title_en", slug: "slug.current" },
    prepare({ title, slug }) {
      return { title: title ?? "(untitled)", subtitle: slug };
    },
  },
  orderings: [
    {
      title: "Order rank",
      name: "orderRankAsc",
      by: [{ field: "orderRank", direction: "asc" }],
    },
  ],
});
