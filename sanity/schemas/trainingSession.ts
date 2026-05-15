import { defineField, defineType } from "sanity";

export const trainingSession = defineType({
  name: "trainingSession",
  title: "Training Session",
  type: "document",
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
      name: "startDate",
      title: "Start date",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "endDate",
      title: "End date",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      options: {
        list: [
          { title: "In person", value: "in-person" },
          { title: "Online", value: "online" },
          { title: "Hybrid", value: "hybrid" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "province",
      title: "Province",
      type: "string",
      description:
        'Required for in-person and hybrid sessions. Use consistent names (e.g. "Bangkok", not "BKK") so filtering works.',
    }),
    defineField({
      name: "host",
      title: "Host",
      type: "string",
      description: "Hosting body or WS Energy team running the session.",
    }),
    defineField({
      name: "capacity",
      title: "Capacity",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "seatsRemaining",
      title: "Seats remaining",
      type: "number",
      description: 'Set to 0 to show a "Full" badge. Leave empty if not tracking.',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration URL",
      type: "url",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "Thai", value: "th" },
          { title: "English", value: "en" },
          { title: "Both", value: "both" },
        ],
        layout: "radio",
      },
      initialValue: "th",
    }),
  ],
  preview: {
    select: { title: "title_en", date: "startDate", province: "province" },
    prepare({ title, date, province }) {
      const subtitle = [date, province].filter(Boolean).join(" • ");
      return { title: title ?? "(untitled)", subtitle: subtitle || undefined };
    },
  },
  orderings: [
    {
      title: "Start date, newest first",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
    {
      title: "Start date, oldest first",
      name: "startDateAsc",
      by: [{ field: "startDate", direction: "asc" }],
    },
  ],
});
