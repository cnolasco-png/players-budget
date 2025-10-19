// Simple health check for Vercel Serverless Functions
// Responds with { ok: true } for monitoring and uptime checks

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Content-Type', 'application/json');
    // Allow GET/HEAD/OPTIONS; reject others to keep it simple
    if (req.method && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    // Basic response
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('health check error', error);
    res.status(500).json({ ok: false });
  }
}
