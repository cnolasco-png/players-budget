import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const site = process.env.SITE_URL || 'http://localhost:8080';
  const sessionId = `mock_${Date.now()}`;
  const url = `${site}/#/claim?session_id=${sessionId}`;
  res.json({ url, session_id: sessionId });
}
