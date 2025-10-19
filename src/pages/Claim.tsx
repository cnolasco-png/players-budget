import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type ClaimResponse = {
  ok?: boolean;
  already_pro?: boolean;
  error?: string;
};

const Claim = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const claimStripeSession = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/claim-stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const body = (await resp.json()) as ClaimResponse;
      if (!resp.ok) {
        throw new Error(body?.error || "Claim failed");
      }
      if (body?.already_pro) {
        setResult("Your account is already Pro.");
        toast({ title: "Already Pro", description: "Your account already has the Pro plan." });
      } else {
        setResult("Your account was upgraded to Pro.");
        toast({ title: "Account upgraded", description: "Your account was upgraded to Pro." });
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unable to claim purchase";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, toast]);

  useEffect(() => {
    if (!sessionId) return;
    void claimStripeSession();
  }, [claimStripeSession, sessionId]);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Claim</h1>
      <p className="text-sm text-muted-foreground">Use this endpoint to finish Stripe sessions in dev.</p>
      <p className="text-sm mt-4">To claim a purchase, call the server endpoint with <code>session_id</code>.</p>

      {sessionId ? (
        <div className="mt-6">
          <p className="text-sm">
            Found session_id: <code>{sessionId}</code>
          </p>
          <div className="mt-4">
            <Button onClick={claimStripeSession} disabled={loading}>
              {loading ? "Claiming…" : "Claim purchase"}
            </Button>
          </div>

          {result && <p className="mt-4 text-green-600">{result}</p>}
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          No session_id found in the URL. Complete checkout and return to this page.
        </p>
      )}
    </main>
  );
};

export default Claim;
