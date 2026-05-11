import { defineField, defineType } from "sanity";

export const brand = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({
      name: "authorizedDistributor",
      title: "WS Energy is an authorized distributor",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "whyWeCarryIt_en", title: "Why we carry it (EN)", type: "text" }),
    defineField({ name: "whyWeCarryIt_th", title: "Why we carry it (TH)", type: "text" }),
    defineField({
      name: "authorizationDocument",
      title: "Authorization document",
      type: "reference",
      to: [{ type: "docFile" }],
    }),
  ],
  preview: { select: { title: "name", media: "logo" } },
});
