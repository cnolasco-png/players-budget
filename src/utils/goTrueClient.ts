import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let browserClient: SupabaseClient<Database> | null = null;

const newId = () => Math.random().toString(36).slice(2, 10);

export function getGoTrueClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

  browserClient = createClient<Database>(url, anonKey, {
    auth: {
      storage: isBrowser ? window.localStorage : undefined,
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-client-info": `players-budget/${newId()}`,
      },
    },
  });

  return browserClient;
}
