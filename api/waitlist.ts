import { createClient } from '@supabase/supabase-js';

// In-memory rate limiting (TODO: Replace with Upstash Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

/**
 * Basic email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Rate limiting by IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const key = `ip:${ip}`;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup on each request
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    }
  }
  
  const existing = rateLimitMap.get(key);
  
  if (!existing || now > existing.resetTime) {
    // First request or window expired, reset counter
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }
  
  if (existing.count >= RATE_LIMIT_MAX) {
    return { 
      allowed: false, 
      resetTime: existing.resetTime 
    };
  }
  
  // Increment counter
  existing.count++;
  rateLimitMap.set(key, existing);
  
  return { allowed: true };
}

/**
 * Get client IP address from request
 */
function getClientIP(req: any): string {
  // Try various headers that might contain the real IP
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }
  
  if (cfConnectingIP) {
    return Array.isArray(cfConnectingIP) ? cfConnectingIP[0] : cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
}

/**
 * Waitlist API Handler
 * POST { moduleSlug, email } -> insert into waitlist_signups.
 * Attach user_id if logged in; basic email validation; return { ok:true }.
 * Rate-limit by IP 10/min (lightweight in-memory fallback, with TODO for Upstash).
 * Method GET should 405.
 */
export const handler = async (req: any, res: any) => {
  // Handle GET method with 405
  if (req.method === 'GET') {
    res.status(405).json({ 
      ok: false, 
      error: 'Method GET not allowed' 
    });
    res.setHeader('Allow', 'POST');
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ 
      ok: false, 
      error: `Method ${req.method} not allowed` 
    });
    res.setHeader('Allow', 'POST');
    return;
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitResult = checkRateLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        ok: false, 
        error: 'Rate limit exceeded. Please try again later.',
        resetTime: rateLimitResult.resetTime 
      });
      return;
    }

    // Parse request body
    const { moduleSlug, email } = req.body || {};

    // Basic validation
    if (!moduleSlug || typeof moduleSlug !== 'string') {
      res.status(400).json({
        ok: false, 
        error: 'moduleSlug is required and must be a string' 
      });
      return;
    }

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        ok: false, 
        error: 'email is required and must be a string' 
      });
      return;
    }

    // Email validation
    if (!isValidEmail(email)) {
      res.status(400).json({
        ok: false, 
        error: 'Please provide a valid email address' 
      });
      return;
    }

    // Create server-side Supabase client for secure operations
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user is logged in (optional)
    let userId: string | null = null;
    
    try {
      // Try to get user from the authorization header if provided
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Create client-side supabase instance to verify token
        const supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
        if (!authError && user) {
          userId = user.id;
        }
      }
    } catch (authError) {
      // Auth is optional, continue without user_id
      console.log('Optional auth check failed:', authError);
    }

    // Verify the module exists
    const { data: moduleExists, error: moduleError } = await supabaseServer
      .from('course_modules')
      .select('slug')
      .eq('slug', moduleSlug)
      .single();

    if (moduleError || !moduleExists) {
      res.status(400).json({
        ok: false, 
        error: 'Invalid module specified' 
      });
      return;
    }

    // Check if email already exists for this module
    const { data: existingSignup, error: checkError } = await supabaseServer
      .from('waitlist_signups')
      .select('id')
      .eq('module_slug', moduleSlug)
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database error checking existing signup:', checkError);
      res.status(500).json({
        ok: false, 
        error: 'Database error occurred' 
      });
      return;
    }

    if (existingSignup) {
      res.status(409).json({
        ok: false, 
        error: 'This email is already on the waitlist for this module' 
      });
      return;
    }

    // Insert into waitlist_signups
    const { data: insertData, error: insertError } = await supabaseServer
      .from('waitlist_signups')
      .insert({
        module_slug: moduleSlug,
        email: email.toLowerCase(),
        user_id: userId
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Database error inserting waitlist signup:', insertError);
      res.status(500).json({
        ok: false, 
        error: 'Failed to join waitlist. Please try again.' 
      });
      return;
    }

    res.json({
      ok: true,
      message: 'Successfully joined the waitlist!',
      id: insertData.id
    });

  } catch (error) {
    console.error('Unexpected error in waitlist API:', error);
    res.status(500).json({
      ok: false, 
      error: 'An unexpected error occurred' 
    });
  }
};

// Default export for Vercel API routes
export default handler;
