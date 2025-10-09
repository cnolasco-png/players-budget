import type { ViteDevServer } from 'vite';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userId } = req.body || {};
    const priceId = process.env.STRIPE_PRICE_ID_PRO;
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    if (!priceId) return res.status(500).json({ error: 'Missing STRIPE_PRICE_ID_PRO' });

    const site = process.env.SITE_URL || siteUrl;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      // Use hash routes so client-side HashRouter picks up the params
      success_url: `${site}/#/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/#/pricing`,
      client_reference_id: userId,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Unable to create session' });
  }
};

// simple adapter for Vite dev server / Netlify-like functions
export default (req: any, res: any) => handler(req, res);
