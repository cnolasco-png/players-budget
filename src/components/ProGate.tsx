import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { usePro } from "@/hooks/usePro";

export default function ProGate({ children }: { children: ReactNode }) {
  const { isPro, loading } = usePro();
  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Checking your plan…</div>;
  if (isPro) return <>{children}</>;

  return (
    <div className="max-w-3xl mx-auto p-8 text-center space-y-4 border rounded-2xl">
      <h2 className="text-xl font-semibold">Pro feature</h2>
      <p className="text-muted-foreground">
        The Sponsor Deck & 7-Day Action Plan are available on <span className="font-medium">Pro</span>.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button asChild><a href="/#/pricing">Upgrade to Pro</a></Button>
        <Button variant="outline" asChild><a href="/#/auth">Sign in</a></Button>
      </div>
    </div>
  );
}
