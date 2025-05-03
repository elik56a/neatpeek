import { NextResponse } from "next/server";
import Stripe from "stripe";

// Use a dummy key for build time, will be replaced with real key in production
const DUMMY_KEY = "sk_test_dummy_key_for_build";
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia", // Use the latest version
    })
  : new Stripe(DUMMY_KEY, {
      apiVersion: "2025-02-24.acacia",
    });

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    // Check if we're using the dummy key (build/development without Stripe)
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === DUMMY_KEY) {
      console.warn("Using dummy Stripe key. Checkout functionality is disabled.");
      return NextResponse.json(
        { error: "Stripe is not configured in this environment" },
        { status: 503 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${request.headers.get("origin")}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the checkout session" },
      { status: 500 }
    );
  }
}
