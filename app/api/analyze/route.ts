import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { normalizeResumeText, extractResumeText } from "@/lib/resume";
import { getStripeClient } from "@/lib/stripe";
import type { AnalysisPlan, AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";

const schema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  suggestions: z.array(z.string()).min(1),
  grammarIssues: z.array(z.string()).min(1),
  missingKeywords: z.array(z.string()).min(1),
  atsOptimization: z.array(z.string()).min(1),
  summary: z.string().min(1),
  improvedResume: z.string().optional(),
});

function buildPrompt(resumeText: string, plan: AnalysisPlan) {
  const detailedMode = plan === "detailed";

  return `
You are an expert resume reviewer and ATS optimization specialist.
Analyze the resume below and return strict JSON with these keys:
- score: number from 0 to 100
- strengths: array of concise strings
- weaknesses: array of concise strings
- suggestions: array of concise strings
- grammarIssues: array of concise strings
- missingKeywords: array of concise strings
- atsOptimization: array of concise strings
- summary: short paragraph
${detailedMode ? "- improvedResume: a polished improved resume draft in plain text" : ""}

Rules:
- Be specific and actionable.
- Keep each bullet concise.
- Focus on grammar, missing keywords, ATS optimization, and practical improvements.
- If information is missing, say what should be added.
- ${
    detailedMode
      ? "Provide richer, more tactical feedback and include a full improved resume draft."
      : "Provide a concise basic analysis only."
  }

Resume:
"""${resumeText}"""
`.trim();
}

async function verifyCheckoutSession(checkoutSessionId: string) {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  return session.payment_status === "paid" && session.amount_total === 500;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const plan = String(formData.get("plan") || "basic") as AnalysisPlan;
    const resumeTextInput = String(formData.get("resumeText") || "");
    const file = formData.get("file");
    const checkoutSessionId = String(formData.get("checkoutSessionId") || "");

    let extractedText = resumeTextInput.trim();

    if (!extractedText && file instanceof File) {
      extractedText = await extractResumeText(file);
    }

    extractedText = normalizeResumeText(extractedText);

    if (!extractedText) {
      return NextResponse.json(
        { error: "No resume text found. Upload a file or paste resume text." },
        { status: 400 },
      );
    }

    if (plan === "detailed") {
      if (!checkoutSessionId) {
        return NextResponse.json(
          { error: "Detailed analysis requires a verified payment session." },
          { status: 402 },
        );
      }

      const verified = await verifyCheckoutSession(checkoutSessionId);
      if (!verified) {
        return NextResponse.json(
          { error: "Payment verification failed for detailed analysis." },
          { status: 402 },
        );
      }
    }

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: plan === "detailed" ? 0.5 : 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a precise resume reviewer that returns valid JSON only. Do not wrap JSON in markdown.",
        },
        {
          role: "user",
          content: buildPrompt(extractedText, plan),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("The AI service returned an empty response.");
    }

    const parsed = schema.parse(JSON.parse(content)) as AnalysisResult;
    parsed.plan = plan;

    return NextResponse.json({
      extractedText,
      result: parsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected error while analyzing resume.",
      },
      { status: 500 },
    );
  }
}
