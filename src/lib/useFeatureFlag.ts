/* Copilot: implement useFeatureFlag(key) -> { enabled, releaseAt?, loading }.
   Read from Supabase table public.feature_flags via anon client on the client side.
   If release_at <= now, treat as enabled even if enabled=false. Cache result in memory for the session. */

import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface FeatureFlag {
  enabled: boolean
  releaseAt?: string | null
  loading: boolean
}

// In-memory cache for the session
const featureFlagCache = new Map<string, { data: FeatureFlag; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useFeatureFlag(key: string): FeatureFlag {
  const [flag, setFlag] = useState<FeatureFlag>({ enabled: false, loading: true })
  
  useEffect(() => {
    let mounted = true
    
    async function fetchFeatureFlag() {
      try {
        // Check cache first
        const cached = featureFlagCache.get(key)
        const now = Date.now()
        
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          if (mounted) setFlag(cached.data)
          return
        }
        
        const { data, error } = await supabase
          .from('feature_flags')
          .select('enabled, release_at')
          .eq('key', key)
          .single()
        
        if (error && error.code !== 'PGRST116') { // Not found is ok
          console.error('Error fetching feature flag:', error)
          if (mounted) setFlag({ enabled: false, loading: false })
          return
        }
        
        // Determine if feature is enabled
        const currentTime = new Date()
        const releaseAt = data?.release_at ? new Date(data.release_at) : null
        const isEnabled = data?.enabled || (releaseAt && releaseAt <= currentTime) || false
        
        const result: FeatureFlag = {
          enabled: isEnabled,
          releaseAt: data?.release_at || null,
          loading: false
        }
        
        // Cache the result
        featureFlagCache.set(key, { data: result, timestamp: now })
        
        if (mounted) setFlag(result)
        
      } catch (error) {
        console.error('Error in useFeatureFlag:', error)
        if (mounted) setFlag({ enabled: false, loading: false })
      }
    }
    
    fetchFeatureFlag()
    
    return () => {
      mounted = false
    }
  }, [key])
  
  return flag
}
