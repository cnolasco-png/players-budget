import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserSubscription {
  status: string;
  current_period_end: string;
}

interface UseProResult {
  isPro: boolean;
  loading: boolean;
  error: string | null;
}

// Cache subscription data for 5 minutes to avoid repeated queries
const subscriptionCache = new Map<string, { data: UserSubscription | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to check if the current user has an active Pro subscription
 * 
 * Query public.user_subscriptions for the current auth user (status and current_period_end).
 * isPro = status in ('active','trialing') && now < current_period_end
 * 
 * @returns {UseProResult} Object containing isPro status, loading state, and error
 */
export function usePro(): UseProResult {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const checkProStatus = async () => {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          if (isMounted) {
            setError('Authentication error');
            setIsPro(false);
            setLoading(false);
          }
          return;
        }

        if (!user) {
          // Not authenticated - definitely not pro
          if (isMounted) {
            setIsPro(false);
            setLoading(false);
            setError(null);
          }
          return;
        }

        // Check cache first
        const cacheKey = user.id;
        const cached = subscriptionCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          if (isMounted) {
            const isProUser = checkSubscriptionStatus(cached.data);
            setIsPro(isProUser);
            setLoading(false);
            setError(null);
          }
          return;
        }

        // Query subscription data
        const { data: subscription, error: subError } = await supabase
          .from('user_subscriptions')
          .select('status, current_period_end')
          .eq('user_id', user.id)
          .maybeSingle();

        if (subError) {
          console.error('Subscription query error:', subError);
          // If user_subscriptions table doesn't exist, treat as non-pro
          if (subError.code === '42P01') {
            console.warn('user_subscriptions table not found, treating as non-pro');
            if (isMounted) {
              setIsPro(false);
              setLoading(false);
              setError(null);
            }
            return;
          }
          
          if (isMounted) {
            setError('Failed to check subscription status');
            setIsPro(false);
            setLoading(false);
          }
          return;
        }

        // Cache the result
        subscriptionCache.set(cacheKey, {
          data: subscription,
          timestamp: Date.now()
        });

        if (isMounted) {
          const isProUser = checkSubscriptionStatus(subscription);
          setIsPro(isProUser);
          setLoading(false);
          setError(null);
        }

      } catch (err) {
        console.error('Unexpected error in usePro:', err);
        if (isMounted) {
          setError('Unexpected error occurred');
          setIsPro(false);
          setLoading(false);
        }
      }
    };

    checkProStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Show toast for errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Subscription Check Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return { isPro, loading, error };
}

/**
 * Helper function to determine if subscription data indicates Pro status
 */
function checkSubscriptionStatus(subscription: UserSubscription | null): boolean {
  if (!subscription) {
    return false;
  }

  const { status, current_period_end } = subscription;
  const now = new Date();
  const periodEnd = new Date(current_period_end);

  // isPro = status in ('active','trialing') && now < current_period_end
  const validStatuses = ['active', 'trialing'];
  const isValidStatus = validStatuses.includes(status);
  const isNotExpired = now < periodEnd;

  return isValidStatus && isNotExpired;
}
