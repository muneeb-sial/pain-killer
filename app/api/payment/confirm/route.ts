import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const verified =
      session.payment_status === "paid" &&
      session.metadata?.product === "resume_checker_detailed_analysis";

    return NextResponse.json({ verified });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected error while confirming payment.",
      },
      { status: 500 },
    );
  }
}
