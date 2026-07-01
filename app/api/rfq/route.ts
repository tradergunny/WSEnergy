import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { sanityWriteClient } from "@/lib/sanity/client";
import {
  ESTIMATOR_SOURCE,
  estimatePayloadSchema,
  isCompanyRequired,
} from "@/lib/estimator/lead";

const resend = new Resend(process.env.RESEND_API_KEY);

// Dev routing — once ws-energy.co.th domain is verified on Resend,
// switch from onboarding@resend.dev to noreply@ws-energy.co.th
// and send notifications to sales@ws-energy.co.th instead of the dev address.
const FROM_EMAIL = "onboarding@resend.dev";
const NOTIFICATION_EMAIL = "gbteamworking@gmail.com";

const rfqSchema = z
  .object({
    projectType: z.string().optional(),
    projectSize: z.string().optional(),
    productsOfInterest: z.array(z.string()).optional(),
    timeline: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    // Company is conditionally required (see superRefine) — homeowners arriving
    // from the estimator don't have one.
    company: z.string().optional(),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(1, "Phone is required"),
    role: z.string().optional(),
    notes: z.string().optional(),
    // Estimator handoff (Step 5).
    source: z.literal(ESTIMATOR_SOURCE).optional(),
    estimate: estimatePayloadSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (isCompanyRequired(data.source) && !data.company?.trim()) {
      ctx.addIssue({ code: "custom", path: ["company"], message: "Company is required" });
    }
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
      source: data.source ?? "",
      ...(data.estimate ? { estimate: data.estimate } : {}),
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

  const est = data.estimate;
  const estimateLines = est
    ? [
        "",
        "— Solar estimate —",
        `Verdict: ${est.verdict}`,
        `Recommended size: ${est.recommendedKwp} kWp${est.priceThb != null ? ` (฿${est.priceThb.toLocaleString()})` : ""}`,
        `Phase: ${est.phase}`,
        `Monthly bill: ฿${est.monthlyBillThb.toLocaleString()} · daytime use ${Math.round(est.dayUsageFraction * 100)}%`,
        est.roofAreaSqm != null ? `Roof area: ${est.roofAreaSqm} m²` : null,
        est.paybackYears != null ? `Payback: ${est.paybackYears} yr` : null,
        `Est. savings: ฿${est.monthlySavingsThb.toLocaleString()}/mo · ฿${est.annualSavingsThb.toLocaleString()}/yr${est.monthlyBillThb > 0 ? ` (≈${Math.round((est.monthlySavingsThb / est.monthlyBillThb) * 100)}% of bill)` : ""}`,
      ].filter(Boolean)
    : [];

  const summaryLines = [
    `Reference: ${reference}`,
    data.source ? `Source: ${data.source}` : null,
    `Name: ${data.name}`,
    data.company ? `Company: ${data.company}` : null,
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
    ...estimateLines,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: NOTIFICATION_EMAIL,
        subject: `New RFQ: ${reference} — ${data.company || data.name}${data.source === ESTIMATOR_SOURCE ? " (estimator)" : ""}`,
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
