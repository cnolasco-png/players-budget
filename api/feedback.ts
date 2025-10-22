import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Database } from '../src/integrations/supabase/types';
import type { FeedbackPayload, FeedbackRole } from '../src/lib/feedbackService';
import { supabaseAdmin } from '../src/lib/serverSupabase';

const HAS_SUPABASE_CREDS = Boolean(
  (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL) &&
  (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '')
);

const ALLOWED_ROLES: FeedbackRole[] = ['player', 'sponsor', 'coach'];

function coerceRole(role: unknown): FeedbackRole {
  return typeof role === 'string' && (ALLOWED_ROLES as string[]).includes(role) ? (role as FeedbackRole) : 'player';
}

function parseNumber(value: unknown, { min, max }: { min: number; max: number }): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  if (num < min || num > max) return null;
  return num;
}

function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function toSlugArray(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

export const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: `Method ${req.method} not allowed` });
    res.setHeader('Allow', 'POST');
    return;
  }

  if (!HAS_SUPABASE_CREDS) {
    res.status(500).json({ ok: false, error: 'Supabase admin client not configured' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : req.body ?? {};
    const payload = body as Partial<FeedbackPayload>;

    const quote = typeof payload.quote === 'string' ? payload.quote.trim().slice(0, 240) : '';
    if (!quote) {
      res.status(400).json({ ok: false, error: 'Quote is required' });
      return;
    }

    const role = coerceRole(payload.role);
    const rating = parseNumber(payload.rating ?? null, { min: 0, max: 10 });
    const consentPublish = Boolean(payload.consentPublish);
    const consentName = Boolean(payload.consentName);
    const consentOrg = Boolean(payload.consentOrg);
    const name = consentName && typeof payload.name === 'string' ? payload.name.trim().slice(0, 120) || null : null;
    const org = consentOrg && typeof payload.org === 'string' ? payload.org.trim().slice(0, 120) || null : null;
    const title = typeof payload.title === 'string' ? payload.title.trim().slice(0, 120) || null : null;
    const mediaUrl = sanitizeUrl(payload.mediaUrl);
    const avatarUrl = sanitizeUrl(payload.avatarUrl);
    const userId = typeof payload.userId === 'string' ? payload.userId : null;
    const prospectId = typeof payload.prospectId === 'string' ? payload.prospectId : null;
    const activationId = typeof payload.activationId === 'string' ? payload.activationId : null;

    const insertPayload: Database['public']['Tables']['feedback']['Insert'] = {
      role,
      rating,
      quote,
      consent_publish: consentPublish,
      name,
      org,
      title,
      media_url: mediaUrl,
      avatar_url: avatarUrl,
      user_id: userId,
      prospect_id: prospectId,
      activation_id: activationId,
      tags: toSlugArray(payload.mainWin),
      sentiment: null,
    };

    const { error, data } = await supabaseAdmin
      .from('feedback')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) {
      console.error('Feedback insert failed', error);
      res.status(500).json({ ok: false, error: error.message ?? 'Failed to submit feedback' });
      return;
    }

    try {
      await supabaseAdmin.rpc('rollup_homepage_stats');
    } catch (rpcError) {
      console.warn('rollup_homepage_stats RPC failed', rpcError);
    }

    res.status(200).json({ ok: true, id: data?.id ?? null });
  } catch (error) {
    console.error('Unexpected feedback API error', error);
    res.status(500).json({ ok: false, error: 'An unexpected error occurred' });
  }
};

export default handler;
