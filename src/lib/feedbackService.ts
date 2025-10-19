import { supabase } from "@/lib/supabaseClient";

export type FeedbackRole = "player" | "sponsor" | "coach";
export type FeedbackStatus = "pending" | "approved" | "rejected";

export type FeedbackPayload = {
  role: FeedbackRole;
  rating: number | null;
  mainWin: string | null;
  quote: string;
  consentPublish: boolean;
  consentName: boolean;
  consentOrg: boolean;
  name?: string | null;
  org?: string | null;
  title?: string | null;
  mediaUrl?: string | null;
  avatarUrl?: string | null;
  userId?: string | null;
  prospectId?: string | null;
  activationId?: string | null;
};

export async function submitFeedback(payload: FeedbackPayload) {
  const { error } = await supabase.from("feedback").insert({
    role: payload.role,
    rating: payload.rating,
    quote: payload.quote,
    name: payload.consentName ? payload.name : null,
    org: payload.consentOrg ? payload.org : null,
    title: payload.title,
    media_url: payload.mediaUrl,
    avatar_url: payload.avatarUrl,
    consent_publish: payload.consentPublish,
    user_id: payload.userId,
    prospect_id: payload.prospectId,
    activation_id: payload.activationId,
    tags: payload.mainWin ? [payload.mainWin] : [],
  });
  if (error) throw error;
}

export type ActivationSurveyPayload = {
  prospectId: string;
  activationId?: string;
  attendees: number;
  qrScans: number;
  redemptions: number;
  signups: number;
  outcome: string;
  mediaUrl?: string | null;
};

export async function submitActivationSurvey(payload: ActivationSurveyPayload) {
  const { data, error } = await supabase
    .from("feedback")
    .insert({
      role: "player",
      prospect_id: payload.prospectId,
      activation_id: payload.activationId ?? null,
      quote: payload.outcome,
      rating: null,
      consent_publish: false,
      tags: ["activation", "metrics"],
      sentiment: "pos",
      media_url: payload.mediaUrl ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;

  await rollupHomepageStats();

  return data;
}

export async function approveFeedback(id: string) {
  const { error } = await supabase.from("feedback").update({ status: "approved" }).eq("id", id);
  if (error) throw error;
  await rollupHomepageStats();
}

export async function rejectFeedback(id: string) {
  const { error } = await supabase.from("feedback").update({ status: "rejected" }).eq("id", id);
  if (error) throw error;
}

export async function rollupHomepageStats() {
  await supabase.rpc("rollup_homepage_stats");
}

export async function fetchApprovedFeedback(limit = 30) {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchHomepageStats() {
  const { data, error } = await supabase.from("homepage_stats").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}
