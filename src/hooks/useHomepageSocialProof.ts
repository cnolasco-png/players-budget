import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FeedbackPublic = {
  id: string;
  quote: string;
  role: "player" | "sponsor" | "coach";
  rating: number | null;
  name: string | null;
  org: string | null;
  tags: string[] | null;
  media_url: string | null;
  city?: string | null;
  attendees?: number | null;
  qr_scans?: number | null;
  redemptions?: number | null;
  signups?: number | null;
};

type HomepageStats = {
  total_activations: number;
  total_qr_scans: number;
  total_redemptions: number;
  avg_time_to_first_sponsor: number;
};

export function useHomepageSocialProof() {
  const [feedback, setFeedback] = useState<FeedbackPublic[]>([]);
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: testimonials } = await supabase
        .from("feedback")
        .select("id,quote,role,rating,name,org,tags,media_url")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(30);
      setFeedback(testimonials ?? []);

      const { data: statRow } = await supabase
        .from("homepage_stats")
        .select("total_activations,total_qr_scans,total_redemptions,avg_time_to_first_sponsor")
        .limit(1)
        .maybeSingle();
      if (statRow) setStats(statRow as HomepageStats);

      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("public:feedback")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedback", filter: "status=eq.approved" },
        (payload) => {
          setFeedback((prev) => [payload.new as FeedbackPublic, ...prev].slice(0, 30));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { feedback, stats, loading };
}
