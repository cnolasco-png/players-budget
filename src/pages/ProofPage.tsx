import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

type ProofEntry = {
  id: string;
  quote: string;
  name: string | null;
  org: string | null;
  rating: number | null;
  media_url: string | null;
};

export default function ProofPage() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<ProofEntry | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("feedback")
        .select("id,quote,name,org,rating,media_url")
        .eq("id", id)
        .eq("status", "approved")
        .maybeSingle();
      if (!error && data) setEntry(data as ProofEntry);
    };
    load();
  }, [id]);

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading example...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-700 text-white">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <Card className="rounded-3xl border-none shadow-2xl bg-white text-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Local sponsor win</CardTitle>
            <CardDescription>Real results from the Player&apos;s Budget community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="text-xl leading-relaxed">“{entry.quote}”</blockquote>
            <div className="text-sm text-muted-foreground">
              {entry.name ? entry.name : "Verified sponsor"}
              {entry.org ? ` · ${entry.org}` : null}
            </div>
            {entry.rating != null && (
              <div className="text-amber-500 font-semibold">Rating {entry.rating}/10</div>
            )}
            {entry.media_url && (
              <video src={entry.media_url} controls className="rounded-lg border" preload="metadata" />
            )}
          </CardContent>
          <CardContent className="bg-muted/60 text-sm rounded-b-3xl">
            <p className="text-muted-foreground">
              Want to host locally proven activations like this? Player&apos;s Budget helps tennis players land sponsors with
              tracked QR codes, community clinics, and ready-to-send outreach kits.
            </p>
          </CardContent>
          <CardContent className="flex justify-end pt-4 pb-6">
            <Button asChild>
              <Link to="/auth">Start free → land your first sponsor</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
