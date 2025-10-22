import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getGoTrueClient } from "@/utils/goTrueClient";

export const supabase: SupabaseClient<Database> = getGoTrueClient();
