import { defineField, defineType } from "sanity";

export const installer = defineType({
  name: "installer",
  title: "Certified Installer",
  type: "document",
  fields: [
    defineField({
      name: "companyName",
      title: "Company name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "companyName", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "installerCode",
      title: "Installer code",
      type: "string",
      description: 'Internal partner code (e.g. "WSE-IN-001"). Optional.',
    }),
    defineField({
      name: "tier",
      title: "Partner tier",
      type: "string",
      options: {
        list: [
          { title: "Gold", value: "gold" },
          { title: "Silver", value: "silver" },
          { title: "Authorized", value: "authorized" },
        ],
        layout: "radio",
      },
      initialValue: "authorized",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "contactName",
      title: "Contact name",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (r) =>
        r.custom((value) => {
          if (!value) return true;
          if (typeof value !== "string") return "Must be a string";
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Invalid email";
        }),
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "address_en",
      title: "Address (EN)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "address_th",
      title: "Address (TH)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "province",
      title: "Province",
      type: "string",
      description:
        'Use consistent names (e.g. "Bangkok") so province filtering works across installers.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "district",
      title: "District",
      type: "string",
    }),
    defineField({
      name: "lat",
      title: "Latitude",
      type: "number",
      description: "Optional — stored for future map view (v2).",
    }),
    defineField({
      name: "lng",
      title: "Longitude",
      type: "number",
      description: "Optional — stored for future map view (v2).",
    }),
    defineField({
      name: "services",
      title: "Services offered",
      type: "array",
      of: [{ type: "reference", to: [{ type: "serviceType" }] }],
      validation: (r) => r.min(1).error("Pick at least one service type."),
    }),
    defineField({
      name: "certifications",
      title: "Certifications",
      type: "array",
      of: [{ type: "string" }],
      description: 'Free-text labels (e.g. "TIS-certified", "Projoy trained").',
      options: { layout: "tags" },
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "photo",
      title: "Team / shop photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "yearsActive",
      title: "Years active",
      type: "number",
      description: "How long they have been an installer.",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "orderRank",
      title: "Order rank",
      type: "number",
      description: "Lower numbers appear first. Use to feature top partners.",
      initialValue: 100,
    }),
  ],
  preview: {
    select: {
      title: "companyName",
      tier: "tier",
      province: "province",
      media: "logo",
    },
    prepare({ title, tier, province, media }) {
      const subtitle = [tier ? tier.toUpperCase() : null, province]
        .filter(Boolean)
        .join(" • ");
      return {
        title: title ?? "(untitled)",
        subtitle: subtitle || undefined,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Order rank",
      name: "orderRankAsc",
      by: [{ field: "orderRank", direction: "asc" }],
    },
    {
      title: "Company name A→Z",
      name: "companyAsc",
      by: [{ field: "companyName", direction: "asc" }],
    },
    {
      title: "Tier (Gold first)",
      name: "tierAsc",
      by: [{ field: "tier", direction: "asc" }],
    },
  ],
});
