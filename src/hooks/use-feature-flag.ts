import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFeatureFlag(key: string) {
  // Simple client-side flags to avoid schema coupling:
  // - env: VITE_FLAG_<KEY>=1
  // - localStorage: ff:<key>="true"
  const envVar = `VITE_FLAG_${key.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}`;
  const enabledFromEnv = Boolean((import.meta as any).env?.[envVar]);

  let enabledFromStorage = false;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(`ff:${key}`) : null;
    enabledFromStorage = raw === "true";
  } catch {}

  return enabledFromEnv || enabledFromStorage;
}
