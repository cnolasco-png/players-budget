import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Readable } from 'node:stream';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder');

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(['active', 'trialing']);

async function readRequestBody(req: VercelRequest): Promise<Buffer> {
  if (req.body) {
    if (typeof req.body === 'string') return Buffer.from(req.body);
    if (Buffer.isBuffer(req.body)) return req.body;
  }

  const readable = req as unknown as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(Buffer.from(chunk));
    }
  }
  return Buffer.concat(chunks);
}

function derivePlan(subscription: Stripe.Subscription): 'pro_monthly' | 'pro_yearly' | null {
  const interval = subscription.items?.data?.[0]?.price?.recurring?.interval;
  if (interval === 'month') return 'pro_monthly';
  if (interval === 'year') return 'pro_yearly';
  return null;
}

function determineProfilePlan(status: Stripe.Subscription.Status): 'pro' | 'free' {
  return ACTIVE_STATUSES.has(status) ? 'pro' : 'free';
}

async function resolveUserId(
  subscription: Stripe.Subscription,
  suppliedUserId: string | null,
  customerId: string | null,
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  if (suppliedUserId) {
    return suppliedUserId;
  }

  const metadataUser = (subscription.metadata?.supabase_user_id ??
    subscription.metadata?.user_id ??
    '') as string;
  if (metadataUser) {
    return metadataUser;
  }

  const bySubscription = await supabaseAdmin
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  if (bySubscription.data?.user_id) {
    return bySubscription.data.user_id as string;
  }

  if (customerId) {
    const byCustomer = await supabaseAdmin
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (byCustomer.data?.user_id) {
      return byCustomer.data.user_id as string;
    }
  }

  return null;
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  opts: { userId?: string | null; customerId?: string | null } = {},
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const customerId =
    opts.customerId ??
    (typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null);

  const userId = await resolveUserId(subscription, opts.userId ?? null, customerId);

  if (!userId) {
    console.warn('Stripe webhook: unable to resolve user for subscription', subscription.id);
    return;
  }

  const plan = derivePlan(subscription);
  const primaryItem = subscription.items?.data?.[0];
  const currentPeriodEndUnix = primaryItem?.current_period_end ?? null;
  const currentPeriodEnd = currentPeriodEndUnix
    ? new Date(currentPeriodEndUnix * 1000).toISOString()
    : null;

  const { error: upsertError } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (upsertError) {
    throw new Error(`Failed to upsert subscription: ${upsertError.message}`);
  }

  const nextPlan = determineProfilePlan(subscription.status);
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ plan: nextPlan })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to update profile plan: ${profileError.message}`);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription') {
    return;
  }

  const subscriptionId =
    (typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id) ?? null;

  if (!subscriptionId) {
    console.warn('Stripe webhook: checkout session missing subscription id');
    return;
  }

  const userId =
    session.client_reference_id ??
    (session.metadata?.supabase_user_id as string | undefined) ??
    null;

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product'],
  });

  await syncSubscription(subscription, { userId, customerId });
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const metadataUser = (subscription.metadata?.supabase_user_id ??
    subscription.metadata?.user_id ??
    '') as string;

  await syncSubscription(subscription, {
    userId: metadataUser || null,
    customerId,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!stripeSecretKey || !stripeWebhookSecret) {
    res.status(500).json({ error: 'Stripe environment variables are not configured' });
    return;
  }

  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Supabase environment variables are not configured' });
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    res.status(400).json({ error: 'Missing Stripe signature header' });
    return;
  }

  let event: Stripe.Event;

  try {
    const rawBody = await readRequestBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed', message);
    res.status(400).json({ error: `Webhook Error: ${message}` });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.trial_will_end':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;
      default:
        // Ignore unrelated events
        break;
    }

    res.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook handler error', message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
