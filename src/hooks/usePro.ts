import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionRow = Pick<Database["public"]["Tables"]["user_subscriptions"]["Row"], "status">;

export function usePro() {
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const determineProStatus = async () => {
      // Check localStorage first for demo/testing purposes
      try {
        const localPlan = localStorage.getItem("plan");
        if (localPlan === "pro") {
          if (!cancelled) {
            setIsPro(true);
            setLoading(false);
          }
          return;
        }
      } catch {
        // ignore localStorage errors
      }

      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
          if (!cancelled) {
            setIsPro(false);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .order("current_period_end", { ascending: false })
          .limit(1)
          .maybeSingle<SubscriptionRow>();

        if (error) {
          console.error("usePro subscription lookup error", error);
        }

        const active = data ? (data.status === "active" || data.status === "trialing") : false;
        if (!cancelled) {
          setIsPro(active);
          setLoading(false);
        }
      } catch (err) {
        console.error("usePro unexpected error", err);
        if (!cancelled) {
          setIsPro(false);
          setLoading(false);
        }
      }
    };

    determineProStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isPro, loading };
}

// Support default import as well
export default usePro;
