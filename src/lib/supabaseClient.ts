import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url?.startsWith("http")) throw new Error("VITE_SUPABASE_URL is missing/invalid");

export const supabase: SupabaseClient<Database> = createClient<Database>(url, anon);
