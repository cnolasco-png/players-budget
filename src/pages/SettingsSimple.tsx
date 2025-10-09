import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

  // Quick expense state
  const [budgets, setBudgets] = useState<Array<{id: string; title: string; base_currency: string | null}>>([]);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    budgetId: "",
    category: "",
    amount: "",
    currency: "USD",
    note: "",
  });

  // Feedback state  
  const [feedbackState, setFeedbackState] = useState({
    topic: "",
    message: "",
    email: "",
    submitting: false,
  });

  // Billing and subscription helpers
  const planLabel = profile.plan === "pro" ? "Pro" : profile.plan === "premium" ? "Premium" : "Free";
  const isProPlan = profile.plan === "pro" || profile.plan === "premium";

  const handleUpgrade = () => {
    const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast({
      title: "Upgrade available",
      description: "Contact support to upgrade your account.",
    });
  };

  const handleManageBilling = () => {
    if (!isProPlan) {
      toast({
        title: "Upgrade required",
        description: "Upgrade to Pro to access billing management.",
      });
      return;
    }
    const portalUrl = import.meta.env.VITE_STRIPE_PORTAL_URL;
    if (portalUrl) {
      window.open(portalUrl, "_blank", "noopener,noreferrer");
    } else {
      toast({
        title: "Portal unavailable", 
        description: "Billing portal is not configured yet.",
        variant: "destructive",
      });
    }
  };

  const handleJoinDiscord = () => {
    window.open("https://discord.com/invite/cCd5bByXrg", "_blank", "noopener,noreferrer");
  };

  // Load user's budgets
  const loadBudgets = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("id, title, base_currency")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBudgets(data ?? []);
      
      // Set default budget and currency
      if (data && data.length > 0 && !expenseForm.budgetId) {
        setExpenseForm(prev => ({
          ...prev,
          budgetId: data[0].id,
          currency: data[0].base_currency ?? "USD"
        }));
      }
    } catch (error: any) {
      console.error("Failed to load budgets", error);
    }
  }, [userId, expenseForm.budgetId]);

  // Handle expense form changes
  const handleExpenseFieldChange = (field: keyof typeof expenseForm, value: string) => {
    setExpenseForm(prev => {
      if (field === "budgetId") {
        const budget = budgets.find(b => b.id === value);
        return {
          ...prev,
          budgetId: value,
          currency: budget?.base_currency ?? prev.currency,
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Submit expense
  const handleExpenseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    if (!expenseForm.category.trim() || !expenseForm.amount.trim()) {
      toast({
        title: "Missing details",
        description: "Add a category and amount before saving.",
      });
      return;
    }

    const amountValue = parseFloat(expenseForm.amount.replace(/,/g, ""));
    if (isNaN(amountValue)) {
      toast({
        title: "Invalid amount",
        description: "Use numbers only for your expense amount.",
        variant: "destructive",
      });
      return;
    }

    setExpenseSaving(true);
    try {
      const today = new Date().toISOString().substring(0, 10);
      const { error } = await supabase
        .from("expense_entries")
        .insert({
          user_id: userId,
          budget_id: expenseForm.budgetId || null,
          date: today,
          category: expenseForm.category.trim(),
          amount: amountValue,
          currency: expenseForm.currency.trim().toUpperCase(),
          notes: expenseForm.note.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Expense logged",
        description: "Your expense has been saved successfully.",
      });

      // Reset form
      setExpenseForm(prev => ({
        ...prev,
        category: "",
        amount: "",
        note: "",
      }));
    } catch (error: any) {
      console.error("Failed to log expense", error);
      toast({
        title: "Could not log expense",
        description: `${error.message}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setExpenseSaving(false);
    }
  };

  // Submit feedback
  const handleSubmitFeedback = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!feedbackState.message.trim()) {
      toast({
        title: "Feedback is empty",
        description: "Please add your feedback message.",
      });
      return;
    }

    setFeedbackState(prev => ({ ...prev, submitting: true }));
    try {
      const { error } = await supabase.from("feedback").insert({
        message: feedbackState.message.trim(),
        email: feedbackState.email.trim() || null,
        topic: feedbackState.topic.trim() || null,
        user_id: userId,
      });

      if (error) throw error;

      toast({
        title: "Thanks for the feedback",
        description: "We appreciate you helping us improve.",
      });

      // Reset form
      setFeedbackState({ topic: "", message: "", email: "", submitting: false });
    } catch (error: any) {
      console.error("Failed to submit feedback", error);
      toast({
        title: "Could not send feedback",
        description: `${error.message}. Please try again.`,
        variant: "destructive",
      });
      setFeedbackState(prev => ({ ...prev, submitting: false }));
    }
  };

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

  // Load profile and budgets when user ID is available
  useEffect(() => {
    if (userId) {
      loadProfile();
      loadBudgets();
    }
  }, [userId, loadProfile, loadBudgets]);

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/70 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Update your profile and manage your account.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <LogOut className="mr-2 h-4 w-4" />Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">Customize your player profile and preferences.</p>
            </div>
            <Button onClick={handleProfileSave} disabled={profileSaving || profileLoading}>
              {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {profileSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                disabled={profileLoading}
                value={profile.name}
                onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Add your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Player level</Label>
              <Select
                value={profile.playerLevel || undefined}
                onValueChange={(value) => setProfile((prev) => ({ ...prev, playerLevel: value }))}
                disabled={profileLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                disabled
                value={userEmail || ""}
                placeholder="Email from authentication"
              />
            </div>
            <div className="md:col-span-1 flex items-center justify-between rounded-xl border-2 border-dashed p-4">
              <div>
                <Label className="text-base">Travel with coach?</Label>
                <p className="text-sm text-muted-foreground">Include coach travel costs in budgets</p>
              </div>
              <Switch
                checked={profile.travelsWithCoach}
                disabled={profileLoading}
                onCheckedChange={(checked) => setProfile((prev) => ({ ...prev, travelsWithCoach: checked }))}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Subscription</h2>
              <p className="text-sm text-muted-foreground">Manage your plan and billing preferences.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="text-xl font-semibold">{planLabel}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleManageBilling}>
                Manage billing
              </Button>
              <Button variant="gold" onClick={handleUpgrade}>
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Community</h2>
              <p className="text-sm text-muted-foreground">Connect with other tennis players and get support.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Join our community</p>
              <p className="text-base">Get tips, share experiences, and connect with fellow players</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleJoinDiscord}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Join Discord
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Quick Expense Capture</h2>
            <p className="text-sm text-muted-foreground">
              Log on-the-go expenses so your budget reflects real spending immediately.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleExpenseSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Budget</Label>
                <Select 
                  value={expenseForm.budgetId} 
                  onValueChange={(value) => handleExpenseFieldChange("budgetId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="">Personal (no budget)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <Input
                  id="expense-category"
                  value={expenseForm.category}
                  onChange={(e) => handleExpenseFieldChange("category", e.target.value)}
                  placeholder="Travel, strings, physio..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input
                  id="expense-amount"
                  inputMode="decimal"
                  value={expenseForm.amount}
                  onChange={(e) => handleExpenseFieldChange("amount", e.target.value)}
                  placeholder="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-currency">Currency</Label>
                <Input
                  id="expense-currency"
                  value={expenseForm.currency}
                  onChange={(e) => handleExpenseFieldChange("currency", e.target.value)}
                  maxLength={3}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expense-note">Notes</Label>
                <Textarea
                  id="expense-note"
                  rows={3}
                  value={expenseForm.note}
                  onChange={(e) => handleExpenseFieldChange("note", e.target.value)}
                  placeholder="Optional context for the expense"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={expenseSaving || !expenseForm.category.trim() || !expenseForm.amount.trim()}
            >
              {expenseSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save expense
            </Button>
          </form>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Feedback & Support</h2>
            <p className="text-sm text-muted-foreground">Share ideas or reach our team directly.</p>
          </div>
          
          <form className="grid gap-4" onSubmit={handleSubmitFeedback}>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={feedbackState.topic}
                  onChange={(e) => setFeedbackState(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Feature requests, bug reports..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-email">Reply-to email</Label>
                <Input
                  id="feedback-email"
                  type="email"
                  value={feedbackState.email}
                  onChange={(e) => setFeedbackState(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={5}
                value={feedbackState.message}
                onChange={(e) => setFeedbackState(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us what would make Player's Budget better for you."
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={feedbackState.submitting}>
                {feedbackState.submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {feedbackState.submitting ? "Sending..." : "Share feedback"}
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:team@wolfprocommunity.com?subject=Player%20Budget%20Support">
                  Contact support
                </a>
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Environment Check</h2>
            <p className="text-sm text-muted-foreground">Verify environment variables are loaded.</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-500' : 'text-red-500'}>
              {import.meta.env.VITE_SUPABASE_URL ? '✓ VITE_SUPABASE_URL set' : '✗ VITE_SUPABASE_URL missing'}
            </div>
            <div className={import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'text-green-500' : 'text-red-500'}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✓ VITE_SUPABASE_ANON_KEY set' : '✗ VITE_SUPABASE_ANON_KEY missing'}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
