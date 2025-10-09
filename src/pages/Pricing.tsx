import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;

      const resp = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const body = await resp.json();
      if (!resp.ok) throw new Error(body?.error || "Failed to create checkout session");
      const { url } = body;
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Could not start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Pricing</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Free</h2>
          <p className="text-sm text-muted-foreground">Basic budgeting features for solo players.</p>
          <ul className="mt-4 list-disc pl-5 text-sm">
            <li>One active budget</li>
            <li>Manual exports</li>
            <li>Community support</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Pro</h2>
          <p className="text-sm text-muted-foreground">Premium features for touring players.</p>
          <div className="mt-2 mb-4">
            <p className="text-2xl font-bold">$2.99<span className="text-base font-normal">/month</span></p>
            <p className="text-lg text-muted-foreground">or $29.99/year</p>
          </div>
          <ul className="mt-4 list-disc pl-5 text-sm">
            <li>Multiple budgets</li>
            <li>Priority support</li>
            <li>Professional reports</li>
            <li>Bank-grade accuracy</li>
          </ul>

          <div className="mt-6">
            <Button onClick={handleUpgrade} disabled={loading}>
              {loading ? "Redirecting…" : "Upgrade to Pro - $2.99/month"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Pricing;
