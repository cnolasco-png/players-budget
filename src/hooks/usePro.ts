import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePro() {
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Check localStorage first for demo/testing purposes
      try {
        const localPlan = localStorage.getItem('plan');
        if (localPlan === 'pro') {
          if (!cancelled) { setIsPro(true); setLoading(false); }
          return;
        }
      } catch (e) {
        // ignore localStorage errors
      }

      // Fall back to database check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsPro(false); setLoading(false); return; }
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .order("current_period_end", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) console.error(error);
      const active = !!data && ["active","trialing"].includes((data as any).status);
      if (!cancelled) { setIsPro(active); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return { isPro, loading };
}

// Support default import as well
export default usePro;
