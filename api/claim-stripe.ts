import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? '';
const stripe = new Stripe(stripeSecret || '');

const fetchFn: typeof fetch | null =
  typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null;

type SupabaseProfile = {
  plan?: string | null;
};

type ClaimStripeBody = {
  session_id?: string;
  userId?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!fetchFn) {
    res.status(500).json({ error: 'Global fetch is not available in this runtime.' });
    return;
  }

  try {
    const { session_id: sessionId, userId: mockUserId } = (req.body ?? {}) as ClaimStripeBody;
    if (!sessionId) {
      res.status(400).json({ error: 'Missing session_id' });
      return;
    }

    let userId: string | null = null;
    if (sessionId.startsWith('mock_')) {
      userId = mockUserId ?? null;
    } else {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const paymentStatus = session.payment_status ?? session.status;
      if (paymentStatus !== 'paid' && session.subscription == null) {
        res.status(400).json({ error: 'Session not completed' });
        return;
      }

      userId = session.client_reference_id ?? null;
    }

    if (!userId) {
      res.status(400).json({ error: 'No client_reference_id found' });
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL' });
      return;
    }

    const getRes = await fetchFn(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    });

    if (!getRes.ok) {
      const text = await getRes.text();
      console.error('Supabase fetch failed', text);
      res.status(500).json({ error: 'Failed to fetch profile' });
      return;
    }

    const profiles = (await getRes.json()) as SupabaseProfile[];
    const profile = Array.isArray(profiles) && profiles[0] ? profiles[0] : null;
    const alreadyPro = profile?.plan === 'pro';

    if (alreadyPro) {
      res.json({ ok: true, already_pro: true });
      return;
    }

    const updateRes = await fetchFn(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ plan: 'pro' }),
    });

    if (!updateRes.ok) {
      const text = await updateRes.text();
      console.error('Supabase update failed', text);
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }

    res.json({ ok: true, already_pro: false });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Unable to claim';
    res.status(500).json({ error: message });
  }
}
