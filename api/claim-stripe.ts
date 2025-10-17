import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// use global fetch if available (Node 18+ / runtimes) - TypeScript will allow globalThis.fetch
const _fetch = (globalThis as any).fetch;

export default async (req: any, res: any) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

    // support mocked session ids to run end-to-end locally without Stripe
    let userId = null as string | null;
    if (typeof session_id === 'string' && session_id.startsWith('mock_')) {
      // for mock sessions, accept client_reference_id passed in body (dev only)
      userId = req.body?.userId ?? null;
    } else {
      // fetch the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      // ensure payment succeeded or subscription is active
      const paymentStatus = session.payment_status || session.status;
      if (paymentStatus !== 'paid' && session.subscription == null) {
        return res.status(400).json({ error: 'Session not completed' });
      }

      userId = session.client_reference_id as string | null;
    }
    if (!userId) {
      return res.status(400).json({ error: 'No client_reference_id found' });
    }

    // update Supabase profile using service role key
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL' });
    }

    // fetch existing profile to determine current plan
    const getRes = await _fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
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
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    const profiles = await getRes.json();
    const profile = Array.isArray(profiles) && profiles[0] ? profiles[0] : null;
    const alreadyPro = profile?.plan === 'pro';

    if (alreadyPro) {
      return res.json({ ok: true, already_pro: true });
    }

    // perform patch to set plan to pro
    const updateRes = await _fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
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
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({ ok: true, already_pro: false });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Unable to claim' });
  }
};
