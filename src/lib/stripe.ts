import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY ?? "";

if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe checkout will not function.");
}

export const stripe = secretKey ? new Stripe(secretKey, {}) : null;
