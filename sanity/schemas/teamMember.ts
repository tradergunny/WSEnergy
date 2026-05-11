import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role_en", title: "Role (EN)", type: "string" }),
    defineField({ name: "role_th", title: "Role (TH)", type: "string" }),
    defineField({
      name: "department",
      title: "Department",
      type: "string",
      options: { list: ["sales", "technical", "training", "partner"] },
    }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "lineId", title: "LINE ID", type: "string" }),
    defineField({
      name: "showOnContactPage",
      title: "Show on contact page",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: { select: { title: "name", subtitle: "role_en", media: "photo" } },
});
