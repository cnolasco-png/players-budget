import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FlagMap = Record<string, string>;

const FeatureFlagContext = createContext<FlagMap>({});

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FlagMap>({});

  useEffect(() => {
    const loadFlags = async () => {
      const { data, error } = await supabase.from("ab_flags").select("key, variant");
      if (error) {
        console.warn("Failed to load flags", error);
        return;
      }
      const map: FlagMap = {};
      data?.forEach((entry) => {
        map[entry.key] = entry.variant;
      });
      setFlags(map);
    };
    loadFlags();
  }, []);

  return <FeatureFlagContext.Provider value={flags}>{children}</FeatureFlagContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFeatureFlag(key: string, fallback: string = "A") {
  const flags = useContext(FeatureFlagContext);
  const [bucket, setBucket] = useState<string>(fallback);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(`flag-${key}`) : null;
    const finalVariant = stored ?? flags[key] ?? fallback;
    if (typeof window !== "undefined" && stored == null) {
      window.localStorage.setItem(`flag-${key}`, finalVariant);
    }
    setBucket(finalVariant);
  }, [flags, key, fallback]);

  return bucket;
}
