import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings as SettingsIcon, Loader2, ExternalLink, MessageCircle } from "lucide-react";

const PLAYER_LEVELS = ["Junior", "College", "ITF", "Challenger", "ATP-WTA"];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    playerLevel: "",
    travelsWithCoach: false,
    plan: "free",
  });

  // Load user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email ?? null);
    });
  }, [navigate]);

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!userId) return;
    
    setProfileLoading(true);
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("name, player_level, travels_with_coach, role")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile({
        name: profileData?.name ?? "",
        playerLevel: profileData?.player_level ?? "",
        travelsWithCoach: Boolean(profileData?.travels_with_coach),
        plan: profileData?.role ?? "free",
      });
    } catch (error: any) {
      console.error("Failed to load profile", error);
      toast({
        title: "Unable to load profile",
        description: `${error.message}. Check your connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  }, [toast, userId]);

  // Save profile data
  const handleProfileSave = async () => {
    if (!userId) return;
    
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name || null,
          player_level: profile.playerLevel || null,
          travels_with_coach: profile.travelsWithCoach,
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your preferences have been saved.",
      });
    } catch (error: any) {
      console.error("Failed to update profile", error);
      toast({
        title: "Update failed",
        description: `${error.message}. Check your connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // Load profile when user ID is available
  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, loadProfile]);

  const handleJoinDiscord = () => {
    window.open("https://discord.com/invite/cCd5bByXrg", "_blank", "noopener,noreferrer");
  };

  // Billing helpers
  const planLabel = profile.plan === "pro" ? "Pro" : profile.plan === "premium" ? "Premium" : "Free";
  const isProPlan = profile.plan === "pro" || profile.plan === "premium";

  const handleUpgradeMonthly = () => {
    const monthlyUrl = "https://buy.stripe.com/00w4gz1hC9kh0kS6TqbfO04";
    window.open(monthlyUrl, "_blank", "noopener,noreferrer");
  };

  const handleUpgradeYearly = () => {
    const yearlyUrl = "https://buy.stripe.com/5kQ4gz1hCeEB8RofpWbfO05";
    window.open(yearlyUrl, "_blank", "noopener,noreferrer");
  };

  const handleManageBilling = () => {
    // Use environment variable or fallback to placeholder  
    const stripePortalUrl = import.meta.env.VITE_STRIPE_BILLING_PORTAL_URL || "https://billing.stripe.com/p/login/your-portal-link";
    window.open(stripePortalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-700 to-green-900">
      <header className="border-b bg-card/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto max-w-5xl px-6 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg ring-2 ring-emerald-500/20">
              <SettingsIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Court Settings</h1>
              <p className="text-base text-muted-foreground">Fine-tune your tennis journey preferences</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)} className="shadow-sm">
            <LogOut className="mr-2 h-4 w-4" />Back to Court
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-6 py-10 space-y-10">
        <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Player Profile</h2>
              <p className="text-muted-foreground">Configure your court identity and playing style</p>
            </div>
            <Button onClick={handleProfileSave} disabled={profileSaving || profileLoading} className="shadow-md">
              {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {profileSaving ? "Saving Profile..." : "Update Profile"}
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium">Player Name</Label>
              <Input
                id="name"
                disabled={profileLoading}
                value={profile.name}
                onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Enter your court name"
                className="shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Competition Level</Label>
              <Select
                value={profile.playerLevel || undefined}
                onValueChange={(value) => setProfile((prev) => ({ ...prev, playerLevel: value }))}
                disabled={profileLoading}
              >
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Choose your level" />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium">Account Email</Label>
              <Input
                id="email"
                disabled
                value={userEmail || ""}
                placeholder="Your registered email"
                className="shadow-sm bg-muted/50"
              />
            </div>
            <div className="md:col-span-1 flex items-center justify-between rounded-2xl border-2 border-dashed border-emerald-200 p-6 bg-gradient-to-r from-emerald-50 to-green-50">
              <div>
                <Label className="text-base font-medium">Coach Accompaniment</Label>
                <p className="text-sm text-muted-foreground">Include coaching staff in travel budgets</p>
              </div>
              <Switch
                checked={profile.travelsWithCoach}
                disabled={profileLoading}
                onCheckedChange={(checked) => setProfile((prev) => ({ ...prev, travelsWithCoach: checked }))}
              />
            </div>
          </div>
        </Card>

        <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Court Membership</h2>
              <p className="text-muted-foreground">Elevate your game with premium features</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground/80">Current Membership</p>
                <p className="text-2xl font-bold tracking-tight">{planLabel} Player</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleManageBilling} className="shadow-sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Membership
                </Button>
              </div>
            </div>

            {profile.plan === "free" && (
              <div className="space-y-6">
                <div className="border-t border-emerald-100 pt-6">
                  <h3 className="text-lg font-semibold mb-3 tracking-tight text-emerald-800">Upgrade to Pro Court</h3>
                  <p className="text-muted-foreground mb-6">
                    Unlock advanced analytics and premium tournament planning. 
                    <span className="text-muted-foreground/70"> • International players continue with free access until EU launch.</span>
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="gold" onClick={handleUpgradeMonthly} className="justify-between h-12 shadow-lg font-medium">
                      <span>Monthly Membership</span>
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="gold" onClick={handleUpgradeYearly} className="justify-between h-12 shadow-lg font-medium">
                      <span>Annual Membership</span>
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Players' Lounge</h2>
              <p className="text-muted-foreground">Connect with the global tennis community</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-emerald-600/80 font-medium">Join the conversation</p>
              <p className="text-base font-medium">Share your journey, ask questions, get travel tips, and connect with fellow pro players</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleJoinDiscord} className="shadow-md h-12 font-medium border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300">
                <MessageCircle className="mr-2 h-4 w-4 text-emerald-600" />
                Join Tennis Discord
                <ExternalLink className="ml-2 h-4 w-4 text-emerald-600" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
