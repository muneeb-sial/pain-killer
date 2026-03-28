import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: body.email,
      success_url: `${origin}/results?upgrade=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/results?payment=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 500,
            product_data: {
              name: "AI Resume Checker Premium Analysis",
              description: "Detailed analysis plus downloadable improved resume",
            },
          },
        },
      ],
      metadata: {
        product: "resume_checker_detailed_analysis",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected error while creating payment.",
      },
      { status: 500 },
    );
  }
}
