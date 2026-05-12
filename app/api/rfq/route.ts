import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { sanityWriteClient } from "@/lib/sanity/client";

const resend = new Resend(process.env.RESEND_API_KEY);

// Dev routing — once ws-energy.co.th domain is verified on Resend,
// switch from onboarding@resend.dev to noreply@ws-energy.co.th
// and send notifications to sales@ws-energy.co.th instead of the dev address.
const FROM_EMAIL = "onboarding@resend.dev";
const NOTIFICATION_EMAIL = "gbteamworking@gmail.com";

const rfqSchema = z.object({
  projectType: z.string().optional(),
  projectSize: z.string().optional(),
  productsOfInterest: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().optional(),
  notes: z.string().optional(),
});

function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100_000)
    .toString()
    .padStart(5, "0");
  return `RFQ-${year}-${random}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = rfqSchema.safeParse(body);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed", fieldErrors }, { status: 400 });
  }

  const data = result.data;
  const reference = generateReference();

  try {
    await sanityWriteClient.create({
      _type: "rfqSubmission",
      reference,
      submittedAt: new Date().toISOString(),
      projectType: data.projectType ?? "",
      projectSize: data.projectSize ?? "",
      productsOfInterest: data.productsOfInterest ?? [],
      timeline: data.timeline ?? "",
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      role: data.role ?? "",
      notes: data.notes ?? "",
      status: "new",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 },
    );
  }

  const summaryLines = [
    `Reference: ${reference}`,
    `Name: ${data.name}`,
    `Company: ${data.company}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    data.role ? `Role: ${data.role}` : null,
    data.projectType ? `Project type: ${data.projectType}` : null,
    data.projectSize ? `Project size: ${data.projectSize}` : null,
    data.productsOfInterest?.length
      ? `Products: ${data.productsOfInterest.join(", ")}`
      : null,
    data.timeline ? `Timeline: ${data.timeline}` : null,
    data.notes ? `Notes: ${data.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: NOTIFICATION_EMAIL,
        subject: `New RFQ: ${reference} — ${data.company}`,
        text: `New quote request received.\n\n${summaryLines}`,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        subject: `Your quote request ${reference} — WS Energy`,
        text: [
          `Thank you for your quote request, ${data.name}.`,
          "",
          `Your reference number is ${reference}.`,
          "We'll be in touch within 24 hours with a proposal.",
          "",
          "If you need to fast-track, call us or message via LINE OA.",
          "",
          "— WS Energy Sales Team",
        ].join("\n"),
      }),
    ]);
  } catch {
    // Emails failed but submission is saved — don't block the user
  }

  return NextResponse.json({ reference });
}
