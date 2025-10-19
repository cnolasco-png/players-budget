import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { usePro } from "./usePro";
import { useFeatureFlag } from "./useFeatureFlag";

type CourseModuleRow = Pick<Database["public"]["Tables"]["course_modules"]["Row"], "release_at" | "min_tier">;

type GateReason = "coming_soon" | "pro_required" | null;

export function useModuleGate(slug: string) {
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(true);
  const [reason, setReason] = useState<GateReason>("coming_soon");
  const { isPro, loading: proLoading } = usePro();
  const { enabled: flagEnabled } = useFeatureFlag("fan_monetization");

  useEffect(() => {
    let active = true;

    const evaluateGate = async () => {
      try {
        const { data, error } = await supabase
          .from("course_modules")
          .select("release_at,min_tier")
          .eq("slug", slug)
          .maybeSingle<CourseModuleRow>();

        if (!active) return;

        if (error || !data) {
          setLocked(true);
          setReason("coming_soon");
          setLoading(false);
          return;
        }

        const releaseAt = data.release_at ? new Date(data.release_at).getTime() : undefined;
        const timeEnabled = releaseAt ? releaseAt <= Date.now() : false;
        const comingSoon = !(flagEnabled || timeEnabled);

        if (comingSoon) {
          setLocked(true);
          setReason("coming_soon");
          setLoading(false);
          return;
        }

        if (!proLoading && data.min_tier === "pro" && !isPro) {
          setLocked(true);
          setReason("pro_required");
          setLoading(false);
          return;
        }

        setLocked(false);
        setReason(null);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        console.error("Module gate lookup failed", err);
        setLocked(true);
        setReason("coming_soon");
        setLoading(false);
      }
    };

    evaluateGate();

    return () => {
      active = false;
    };
  }, [flagEnabled, isPro, proLoading, slug]);

  return { locked, reason, loading } as const;
}
