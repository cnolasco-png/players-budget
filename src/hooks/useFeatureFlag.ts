import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type FeatureFlagRow = Pick<Database["public"]["Tables"]["feature_flags"]["Row"], "enabled" | "release_at">;

type FeatureFlagState = {
  enabled: boolean;
  releaseAt?: string;
  loading: boolean;
};

const initialState: FeatureFlagState = {
  enabled: false,
  releaseAt: undefined,
  loading: true,
};

export function useFeatureFlag(key: string) {
  const [state, setState] = useState<FeatureFlagState>(initialState);

  useEffect(() => {
    let active = true;

    const loadFlag = async () => {
      try {
        const { data, error } = await supabase
          .from("feature_flags")
          .select("enabled,release_at")
          .eq("key", key)
          .maybeSingle<FeatureFlagRow>();

        if (!active) return;

        if (error || !data) {
          setState({ enabled: false, releaseAt: undefined, loading: false });
          return;
        }

        const releaseAt = data.release_at ?? undefined;
        const timeEnabled = releaseAt ? new Date(releaseAt).getTime() <= Date.now() : false;
        setState({
          enabled: Boolean(data.enabled) || timeEnabled,
          releaseAt,
          loading: false,
        });
      } catch (err) {
        if (!active) return;
        console.error("Feature flag lookup failed", err);
        setState({ enabled: false, releaseAt: undefined, loading: false });
      }
    };

    loadFlag();

    return () => {
      active = false;
    };
  }, [key]);

  return state;
}
