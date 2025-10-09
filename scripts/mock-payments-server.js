#!/usr/bin/env node
const http = require('http');
const { env } = process;
const SITE = env.SITE_URL || 'http://localhost:8080';
const PORT = Number(env.MOCK_PAYMENTS_PORT || 4001);

function sendJson(res, obj, status = 200) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': String(Buffer.byteLength(body)) });
  res.end(body);
}

async function handleClaimMock(body) {
  const { session_id, userId } = body || {};
  if (!session_id || !session_id.startsWith('mock_')) return { status: 400, body: { error: 'Invalid or missing mock session_id' } };
  if (!userId) return { status: 400, body: { error: 'Missing userId for mock claim' } };

  // If SUPABASE is configured, attempt to patch profile using service role key
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    try {
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}`, apikey: serviceKey }
      });
      if (!profileRes.ok) {
        const txt = await profileRes.text();
        return { status: 500, body: { error: 'Failed to fetch profile', detail: txt } };
      }
      const profiles = await profileRes.json();
      const profile = Array.isArray(profiles) && profiles[0] ? profiles[0] : null;
      if (profile?.plan === 'pro') return { status: 200, body: { ok: true, already_pro: true } };

      const upd = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'return=representation' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      if (!upd.ok) {
        const txt = await upd.text();
        return { status: 500, body: { error: 'Failed to update profile', detail: txt } };
      }
      return { status: 200, body: { ok: true, already_pro: false } };
    } catch (e) {
      return { status: 500, body: { error: 'Supabase request failed', detail: String(e) } };
    }
  }

  // If no Supabase configured, just return success for the mock
  return { status: 200, body: { ok: true, already_pro: false, note: 'mock-only, no supabase configured' } };
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/';
  if (req.method === 'POST' && url === '/api/create-checkout-session-mock') {
    let data = '';
    for await (const chunk of req) data += chunk;
    let parsed = {};
    try { parsed = data ? JSON.parse(data) : {}; } catch (e) { parsed = {}; }
    const userId = parsed.userId || null;
    const sessionId = `mock_${Date.now()}`;
    const redirect = `${SITE}/#/claim?session_id=${sessionId}`;
    // return the session url and session id
    return sendJson(res, { url: redirect, session_id: sessionId, client_reference_id: userId });
  }

  if (req.method === 'POST' && url === '/api/claim-stripe-mock') {
    let data = '';
    for await (const chunk of req) data += chunk;
    let parsed = {};
    try { parsed = data ? JSON.parse(data) : {}; } catch (e) { parsed = {}; }
    const result = await handleClaimMock(parsed);
    return sendJson(res, result.body, result.status);
  }

  // simple health
  if (req.method === 'GET' && url === '/health') return sendJson(res, { ok: true });

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => console.log(`Mock payments server running on http://localhost:${PORT}/ (SITE=${SITE})`));
