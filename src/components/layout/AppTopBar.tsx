import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Academy", path: "/academy/fmsa" },
  { label: "Sponsors", path: "/sponsors/tool" },
  { label: "Settings", path: "/settings" },
];

type AppTopBarProps = {
  title: string;
  subtitle?: string;
};

export function AppTopBar({ title, subtitle }: AppTopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/");
  }, [navigate]);

  return (
    <header className="sticky top-0 z-10 border-b border-primary/70 bg-primary/90 backdrop-blur">
      <div className="border-b border-primary/70 bg-primary">
        <div className="mx-auto flex max-w-7xl gap-6 px-6 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "border-b-2 border-secondary pb-2 text-secondary"
                    : "text-primary-foreground/70 hover:text-secondary"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 text-primary-foreground/70">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="text-primary-foreground/70 hover:bg-primary/70 hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-primary-foreground/70 hover:bg-primary/70 hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
