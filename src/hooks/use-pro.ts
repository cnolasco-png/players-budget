import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Plan = "free" | "pro" | "premium";

export function usePro() {
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user.id;
        if (!userId) {
          if (mounted) setPlan("free");
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        if (mounted) setPlan(((profile?.role as Plan) ?? "free"));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, []);

  return { plan, isPro: plan === "pro" || plan === "premium", loading } as const;
}
