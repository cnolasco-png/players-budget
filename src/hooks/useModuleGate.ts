import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePro } from "./usePro";
import { useFeatureFlag } from "./useFeatureFlag";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

export function useModuleGate(slug: string) {
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(true);
  const [reason, setReason] = useState<"coming_soon"|"pro_required"|null>("coming_soon");
  const { isPro, loading: proLoading } = usePro();
  const { enabled: flagEnabled } = useFeatureFlag("fan_monetization");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("course_modules").select("*").eq("slug", slug).maybeSingle();
      const releaseAt = (data as any)?.release_at ? new Date((data as any).release_at).getTime() : undefined;
      const timeEnabled = releaseAt ? releaseAt <= Date.now() : false;
      const comingSoon = !(flagEnabled || timeEnabled);
      if (comingSoon) { setLocked(true); setReason("coming_soon"); setLoading(false); return; }
      if (!proLoading && (data as any)?.min_tier === "pro" && !isPro) { setLocked(true); setReason("pro_required"); setLoading(false); return; }
      setLocked(false); setReason(null); setLoading(false);
    })();
  }, [slug, flagEnabled, proLoading, isPro]);

  return { locked, reason, loading } as const;
}
