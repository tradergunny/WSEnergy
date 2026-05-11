import { defineField, defineType } from "sanity";

export const rfqSubmission = defineType({
  name: "rfqSubmission",
  title: "RFQ submission",
  type: "document",
  fields: [
    defineField({ name: "reference", title: "Reference (RFQ-YYYY-XXXXX)", type: "string" }),
    defineField({ name: "submittedAt", title: "Submitted at", type: "datetime" }),
    defineField({ name: "projectType", title: "Project type", type: "string" }),
    defineField({ name: "projectSize", title: "Project size", type: "string" }),
    defineField({
      name: "productsOfInterest",
      title: "Products of interest",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "timeline", title: "Timeline", type: "string" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "notes", title: "Notes", type: "text" }),
    defineField({ name: "attachment", title: "Attachment", type: "file" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["new", "contacted", "qualified", "won", "lost"] },
      initialValue: "new",
    }),
  ],
  preview: {
    select: { title: "reference", subtitle: "company", description: "email" },
  },
});
