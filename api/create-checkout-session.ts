import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? '';
const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder');

export const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    if (!stripeSecretKey) {
      res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
      return;
    }

    let parsedBody: unknown = req.body ?? {};
    if (typeof req.body === 'string') {
      try {
        parsedBody = JSON.parse(req.body);
      } catch {
        parsedBody = {};
      }
    }

    const body = parsedBody as { userId?: string };
    const userId = body.userId ?? null;

    const priceId = process.env.STRIPE_PRICE_ID_PRO;
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    if (!priceId) return res.status(500).json({ error: 'Missing STRIPE_PRICE_ID_PRO' });

    const site = process.env.SITE_URL || siteUrl;
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      // Use hash routes so client-side HashRouter picks up the params
      success_url: `${site}/#/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/#/pricing`,
    };

    if (userId) {
      params.client_reference_id = userId;
      params.metadata = { supabase_user_id: userId };
      params.subscription_data = {
        metadata: { supabase_user_id: userId },
      };
    }

    const session = await stripe.checkout.sessions.create(params);

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error', err);
    const message = err instanceof Error ? err.message : 'Unable to create session';
    res.status(500).json({ error: message });
  }
};

// simple adapter for Vite dev server / Netlify-like functions
export default (req: VercelRequest, res: VercelResponse) => handler(req, res);
