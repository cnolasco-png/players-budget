export function useFeatureFlag(key: string) {
  // Simple client-side flags to avoid schema coupling:
  // - env: VITE_FLAG_<KEY>=1
  // - localStorage: ff:<key>="true"
  const envVar = `VITE_FLAG_${key.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}`;
  const envValue = (import.meta.env as Record<string, string | undefined>)[envVar];
  const enabledFromEnv = Boolean(envValue);

  let enabledFromStorage = false;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(`ff:${key}`) : null;
    enabledFromStorage = raw === "true";
  } catch {
    enabledFromStorage = false;
  }

  return enabledFromEnv || enabledFromStorage;
}
