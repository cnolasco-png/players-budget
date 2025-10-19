import type { VercelRequest, VercelResponse } from "@vercel/node";
import { stripe } from "../../src/lib/stripe";
import { supabaseAdmin } from "../../src/lib/serverSupabase";

const PORTAL_RETURN_URL = process.env.STRIPE_CANCEL_URL ?? process.env.SITE_URL ?? "https://players-budget.vercel.app/pricing";

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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    const profileRow = profile as ProfileRow | null;

    if (profileError || !profileRow?.stripe_customer_id) {
      res.status(400).json({ error: "No billing profile found" });
      return;
    }

    const portal = await client.billingPortal.sessions.create({
      customer: profileRow.stripe_customer_id,
      return_url: PORTAL_RETURN_URL,
    });

    res.status(200).json({ url: portal.url });
  } catch (error) {
    console.error("Stripe portal error", error);
    const message = error instanceof Error ? error.message : "Unable to create portal session";
    res.status(500).json({ error: message });
  }
}
type ProfileRow = {
  stripe_customer_id: string | null;
};
