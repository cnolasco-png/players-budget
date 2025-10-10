import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeatureFlag } from './useFeatureFlag';
import { usePro } from './usePro';
import type { Database } from '@/integrations/supabase/types';

type CourseModule = Database['public']['Tables']['course_modules']['Row'];

interface UseModuleGateResult {
  isLocked: boolean;
  lockReason: 'coming_soon' | 'pro_required' | null;
  module: CourseModule | null;
  loading: boolean;
  error: string | null;
}

// Cache module data for 5 minutes to avoid repeated queries
const moduleCache = new Map<string, { data: CourseModule | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to check if a course module is accessible to the current user
 * 
 * Fetch course_modules by slug and feature flag 'fan_monetization'. 
 * If feature flag disabled or module.release_at in future => locked:'coming_soon'.
 * Else if module.min_tier==='pro' and !isPro => locked:'pro_required'
 * 
 * @param moduleSlug - The slug of the course module to check
 * @returns {UseModuleGateResult} Object containing lock status, reason, module data, loading state, and error
 */
export function useModuleGate(moduleSlug: string): UseModuleGateResult {
  const [module, setModule] = useState<CourseModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get feature flag and pro status
  const { enabled: fanMonetizationEnabled, loading: flagLoading } = useFeatureFlag('fan_monetization');
  const { isPro, loading: proLoading } = usePro();

  useEffect(() => {
    let isMounted = true;

    const checkModuleAccess = async () => {
      if (!moduleSlug) {
        if (isMounted) {
          setModule(null);
          setLoading(false);
          setError(null);
        }
        return;
      }

      try {
        // Check cache first
        const cached = moduleCache.get(moduleSlug);
        
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          if (isMounted) {
            setModule(cached.data);
            setLoading(false);
            setError(null);
          }
          return;
        }

        // Query module data
        const { data: moduleData, error: moduleError } = await supabase
          .from('course_modules')
          .select('*')
          .eq('slug', moduleSlug)
          .maybeSingle();

        if (moduleError) {
          console.error('Module query error:', moduleError);
          if (isMounted) {
            setError(`Failed to load module: ${moduleSlug}`);
            setModule(null);
            setLoading(false);
          }
          return;
        }

        // Cache the result
        moduleCache.set(moduleSlug, {
          data: moduleData,
          timestamp: Date.now()
        });

        if (isMounted) {
          setModule(moduleData);
          setLoading(false);
          setError(null);
        }

      } catch (err) {
        console.error('Unexpected error in useModuleGate:', err);
        if (isMounted) {
          setError('Unexpected error occurred');
          setModule(null);
          setLoading(false);
        }
      }
    };

    checkModuleAccess();

    return () => {
      isMounted = false;
    };
  }, [moduleSlug]);

  // Show toast for errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Module Access Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Determine lock status and reason
  const { isLocked, lockReason } = calculateLockStatus({
    module,
    fanMonetizationEnabled,
    isPro,
    flagLoading,
    proLoading,
    moduleLoading: loading
  });

  const overallLoading = loading || flagLoading || proLoading;

  return {
    isLocked,
    lockReason,
    module,
    loading: overallLoading,
    error
  };
}

/**
 * Helper function to calculate lock status based on feature flags, module data, and user status
 */
function calculateLockStatus({
  module,
  fanMonetizationEnabled,
  isPro,
  flagLoading,
  proLoading,
  moduleLoading
}: {
  module: CourseModule | null;
  fanMonetizationEnabled: boolean;
  isPro: boolean;
  flagLoading: boolean;
  proLoading: boolean;
  moduleLoading: boolean;
}): { isLocked: boolean; lockReason: 'coming_soon' | 'pro_required' | null } {
  
  // Still loading - assume unlocked until we know otherwise
  if (flagLoading || proLoading || moduleLoading) {
    return { isLocked: false, lockReason: null };
  }

  // No module found - treat as unlocked (might be a 404 case)
  if (!module) {
    return { isLocked: false, lockReason: null };
  }

  // If feature flag disabled => locked:'coming_soon'
  if (!fanMonetizationEnabled) {
    return { isLocked: true, lockReason: 'coming_soon' };
  }

  // If module.release_at in future => locked:'coming_soon'
  if (module.release_at) {
    const releaseDate = new Date(module.release_at);
    const now = new Date();
    
    if (now < releaseDate) {
      return { isLocked: true, lockReason: 'coming_soon' };
    }
  }

  // If module.min_tier==='pro' and !isPro => locked:'pro_required'
  if (module.min_tier === 'pro' && !isPro) {
    return { isLocked: true, lockReason: 'pro_required' };
  }

  // Module is accessible
  return { isLocked: false, lockReason: null };
}
