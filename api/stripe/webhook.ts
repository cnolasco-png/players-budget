import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } } as const;

async function buffer(readable: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) { chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk); }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const sig = req.headers["stripe-signature"] as string;
  const buf = await buffer(req);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch (err: any) { return res.status(400).send(`Webhook Error: ${err.message}`); }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const upsert = async (sub: Stripe.Subscription) => {
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const status = sub.status;
    const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
    const plan = sub.items.data[0]?.price?.recurring?.interval === "year" ? "pro_yearly" : "pro_monthly";
    const { data: row } = await supabase.from("user_subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    if (!row?.user_id) return;
    await supabase.from("user_subscriptions").upsert({
      user_id: row.user_id, stripe_customer_id: customerId, stripe_subscription_id: sub.id,
      status, plan, current_period_end: periodEnd, cancel_at_period_end: sub.cancel_at_period_end ?? false, updated_at: new Date().toISOString(),
    });
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const sess = event.data.object as Stripe.Checkout.Session;
      if (sess.mode === "subscription" && sess.subscription) {
        const sub = await stripe.subscriptions.retrieve(sess.subscription as string);
        await upsert(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsert(event.data.object as Stripe.Subscription);
      break;
  }

  res.json({ received: true });
}
