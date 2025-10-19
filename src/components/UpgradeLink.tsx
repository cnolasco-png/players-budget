import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Slot } from "@radix-ui/react-slot";

type UpgradeLinkProps = {
  interval?: "monthly" | "yearly";
  source: string;
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
};

export default function UpgradeLink({ interval = "monthly", source, className, children, asChild = false }: UpgradeLinkProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClick = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      const next = `/api/stripe/checkout?plan=pro&interval=${interval}`;
      navigate(`/auth?next=${encodeURIComponent(next)}`);
      return;
    }

    try {
      await supabase.from("upgrade_events").insert({
        user_id: session.user.id,
        source,
        interval,
      });
    } catch (error) {
      console.warn("Failed to log upgrade event", error);
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: "pro", interval }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Unable to start checkout");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again in a moment.";
      toast({
        title: "Upgrade failed",
        description: message,
        variant: "destructive",
      });
    }
  }, [interval, navigate, source, toast]);

  const Component = asChild ? Slot : "button";

  return (
    <Component type={asChild ? undefined : "button"} onClick={handleClick} className={className}>
      {children}
    </Component>
  );
}
