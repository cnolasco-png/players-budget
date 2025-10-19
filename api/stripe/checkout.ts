import type { VercelRequest, VercelResponse } from "@vercel/node";
import { stripe } from "../../src/lib/stripe";
import { supabaseAdmin } from "../../src/lib/serverSupabase";

const SUCCESS_URL = process.env.STRIPE_SUCCESS_URL ?? "";
const CANCEL_URL = process.env.STRIPE_CANCEL_URL ?? "";
const PRICE_MONTHLY = process.env.STRIPE_PRICE_ID_PRO_MONTHLY ?? "";
const PRICE_YEARLY = process.env.STRIPE_PRICE_ID_PRO_YEARLY ?? "";

type CheckoutRequestBody = {
  plan?: string;
  interval?: "monthly" | "yearly";
  return_to?: string;
};

type ProfileRow = {
  stripe_customer_id: string | null;
};

function getPriceId(interval: string) {
  if (interval === "yearly") return PRICE_YEARLY;
  return PRICE_MONTHLY;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const client = stripe;
  if (!client) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { data: userResponse, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userResponse?.user) {
      res.status(401).json({ error: "Invalid session" });
      return;
    }
    const user = userResponse.user;

    const { plan, interval, return_to } = (req.body ?? {}) as CheckoutRequestBody;
    if (plan !== "pro") {
      res.status(400).json({ error: "Unsupported plan" });
      return;
    }
    const billingInterval = interval === "yearly" ? "yearly" : "monthly";
    const priceId = getPriceId(billingInterval);
    if (!priceId) {
      res.status(500).json({ error: "Missing Stripe price configuration" });
      return;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      res.status(500).json({ error: "Failed to load profile" });
      return;
    }

    const profileRow = profile as ProfileRow | null;
    let stripeCustomerId = profileRow?.stripe_customer_id ?? null;
    if (!stripeCustomerId) {
      const customer = await client.customers.create({
        email: user.email ?? undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;
      await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            stripe_customer_id: stripeCustomerId,
          },
          { onConflict: "id" },
        );
    }

    const session = await client.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: SUCCESS_URL || `${process.env.SITE_URL ?? ""}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: CANCEL_URL || `${process.env.SITE_URL ?? ""}/pricing`,
      client_reference_id: user.id,
      metadata: {
        plan: "pro",
        interval: billingInterval,
        supabase_user_id: user.id,
        return_to: return_to ?? "",
      },
    });

    await supabaseAdmin
      .from("checkout_sessions")
      .insert({
        user_id: user.id,
        session_id: session.id,
        plan: plan ?? "pro",
        interval: billingInterval,
        plan_interval: billingInterval,
        status: session.status ?? "created",
        payment_status: session.payment_status ?? null,
      });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    const message = error instanceof Error ? error.message : "Unable to start checkout";
    res.status(500).json({ error: message });
  }
}
