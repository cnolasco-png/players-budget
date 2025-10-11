import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

export function useFeatureFlag(key: string) {
  const [s, set] = useState({ enabled: false, releaseAt: undefined as string | undefined, loading: true });
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("feature_flags").select("*").eq("key", key).maybeSingle();
      const releaseAt = (data as any)?.release_at as string | undefined;
      const timeEnabled = releaseAt ? new Date(releaseAt).getTime() <= Date.now() : false;
      set({ enabled: !!(data as any)?.enabled || timeEnabled, releaseAt, loading: false });
    })();
  }, [key]);
  return s;
}
