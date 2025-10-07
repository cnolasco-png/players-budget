import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/budgetCalculations";
import { Loader2, LogOut, Settings as SettingsIcon, ExternalLink } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const PLAYER_LEVELS = ["Junior", "College", "ITF", "Challenger", "ATP-WTA"];

type FeedbackInsert = {
  message: string;
  email?: string | null;
  topic?: string | null;
  user_id?: string | null;
};

type ExpenseEntryRecord = Tables<"expense_entries">;

type BudgetSummary = {
  id: string;
  title: string;
  base_currency: string | null;
  is_active: boolean | null;
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileRetry, setProfileRetry] = useState(false);
  const [feedbackRetry, setFeedbackRetry] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    playerLevel: "",
    travelsWithCoach: false,
    plan: "free",
  });

  const [feedbackState, setFeedbackState] = useState({
    topic: "",
    message: "",
    email: "",
    submitting: false,
  });

  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntryRecord[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    budgetId: "",
    category: "",
    amount: "",
    currency: "USD",
    note: "",
  });

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

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    setProfileLoading(true);
    setProfileRetry(false);
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
      setProfileRetry(false);
    } catch (error: any) {
      console.error("Failed to load profile", error);
      toast({
        title: "Unable to load profile",
        description: `${error.message}. Check your internet connection and try again.`,
        variant: "destructive",
      });
      setProfileRetry(true);
    } finally {
      setProfileLoading(false);
    }
  }, [toast, userId]);

  const loadBudgets = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("id,title,base_currency,is_active")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const safeBudgets: BudgetSummary[] = (data ?? []).map((entry) => ({
        id: entry.id,
        title: entry.title,
        base_currency: entry.base_currency,
        is_active: entry.is_active,
      }));

      setBudgets(safeBudgets);
      if (safeBudgets.length) {
        setExpenseForm((prev) => {
          if (prev.budgetId) return prev;
          const first = safeBudgets[0];
          return {
            ...prev,
            budgetId: first.id,
            currency: first.base_currency ?? prev.currency,
          };
        });
      }
    } catch (error: any) {
      console.error("Failed to load budgets", error);
      toast({
        title: "Unable to load budgets",
        description: `${error.message}. Try refreshing the page.`,
        variant: "destructive",
      });
    }
  }, [toast, userId]);

  const loadExpenseEntries = useCallback(async () => {
    if (!userId) return;
    setExpenseLoading(true);
    try {
      const { data, error } = await supabase
        .from("expense_entries")
        .select("id, user_id, budget_id, category, amount, currency, note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setExpenseEntries(data ?? []);
    } catch (error: any) {
      console.error("Failed to load expenses", error);
      toast({
        title: "Unable to load expenses",
        description: `${error.message}. Try refreshing the page.`,
        variant: "destructive",
      });
    } finally {
      setExpenseLoading(false);
    }
  }, [toast, userId]);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId, loadProfile]);

  useEffect(() => {
    if (!userId) return;
    loadBudgets();
    loadExpenseEntries();
  }, [userId, loadBudgets, loadExpenseEntries]);

  const planLabel = useMemo(() => {
    if (!profile.plan) return "Free";
    return profile.plan === "pro" ? "Pro" : profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1);
  }, [profile.plan]);

  const isProPlan = (profile.plan ?? "").toLowerCase() === "pro" || (profile.plan ?? "").toLowerCase() === "premium";

  const budgetNameById = useMemo(() => new Map(budgets.map((entry) => [entry.id, entry.title])), [budgets]);

  const handleProfileSave = async () => {
    if (!userId) return;
    setProfileSaving(true);
    setProfileRetry(false);
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
      setProfileRetry(false);
    } catch (error: any) {
      console.error("Failed to update profile", error);
      toast({
        title: "Update failed",
        description: `${error.message}. Check your internet connection and try again.`,
        variant: "destructive",
      });
      setProfileRetry(true);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleManageBilling = () => {
    if (!isProPlan) {
      toast({
        title: "Upgrade required",
        description: "Activate Player's Budget Pro to access billing management.",
      });
      return;
    }
    const portalUrl = import.meta.env.VITE_STRIPE_PORTAL_URL;
    if (!portalUrl) {
      toast({
        title: "Portal unavailable",
        description: "Set VITE_STRIPE_PORTAL_URL to enable billing management.",
        variant: "destructive",
      });
      return;
    }
    window.open(portalUrl, "_blank", "noopener,noreferrer");
  };

  const handleUpgrade = () => {
    const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      return;
    }
    navigate("/onboarding?upgrade=true");
  };

  const handleLaunchPlayerX = () => {
    navigate("/playerx");
  };

  const handleVisitWolfPro = () => {
    window.open("https://www.wolfprocommunity.com/", "_blank", "noopener");
  };

  const handleExpenseFieldChange = (field: keyof typeof expenseForm, value: string) => {
    setExpenseForm((prev) => {
      if (field === "budgetId") {
        const budget = budgets.find((entry) => entry.id === value);
        return {
          ...prev,
          budgetId: value,
          currency: budget?.base_currency ?? prev.currency,
        };
      }

      if (field === "currency") {
        return { ...prev, currency: value.toUpperCase() };
      }

      return { ...prev, [field]: value };
    });
  };

  const handleExpenseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Log in again to save expenses.",
        variant: "destructive",
      });
      return;
    }

    if (!expenseForm.category.trim() || !expenseForm.amount.trim()) {
      toast({
        title: "Missing details",
        description: "Add a category and amount before saving.",
      });
      return;
    }

    const amountValue = Number.parseFloat(expenseForm.amount.replace(/,/g, ""));
    if (Number.isNaN(amountValue)) {
      toast({
        title: "Amount invalid",
        description: "Use numbers only for your expense amount.",
        variant: "destructive",
      });
      return;
    }

    setExpenseSaving(true);
    try {
      const { data, error } = await supabase
        .from("expense_entries")
        .insert({
          user_id: userId,
          budget_id: expenseForm.budgetId || null,
          category: expenseForm.category.trim(),
          amount: amountValue,
          currency: expenseForm.currency.trim().toUpperCase(),
          note: expenseForm.note.trim() ? expenseForm.note.trim() : null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newEntry = data as ExpenseEntryRecord;
      setExpenseEntries((prev) => [newEntry, ...prev].slice(0, 10));
      toast({
        title: "Expense logged",
        description: "We captured that spend in your history.",
      });
      setExpenseForm((prev) => ({
        ...prev,
        category: "",
        amount: "",
        note: "",
      }));
    } catch (error: any) {
      console.error("Failed to log expense", error);
      toast({
        title: "Could not log expense",
        description: `${error.message}. Check your connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setExpenseSaving(false);
    }
  };

  const handleSubmitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedbackState.message.trim()) {
      toast({
        title: "Feedback is empty",
        description: "Add a quick note so we know how to help.",
      });
      return;
    }

    setFeedbackState((prev) => ({ ...prev, submitting: true }));
    setFeedbackRetry(false);
    const payload: FeedbackInsert = {
      message: feedbackState.message.trim(),
      email: feedbackState.email.trim() || null,
      topic: feedbackState.topic.trim() || null,
      user_id: userId,
    };

    try {
      const { error } = await supabase.from("feedback").insert(payload);

      if (error) {
        throw error;
      }

      try {
        await supabase.functions.invoke("send-support-email", {
          body: {
            topic: payload.topic ?? undefined,
            message: payload.message,
            replyTo: payload.email,
            userId,
            userEmail,
          },
        });
      } catch (notifyError) {
        console.error("Failed to email support team", notifyError);
      }

      toast({
        title: "Thanks for the feedback",
        description: "We appreciate you helping us improve.",
      });
      setFeedbackRetry(false);
      setFeedbackState({ topic: "", message: "", email: "", submitting: false });
      return;
    } catch (error: any) {
      console.error("Failed to submit feedback", error);
      toast({
        title: "Could not send feedback",
        description: `${error.message}. Check your internet connection and try again.`,
        variant: "destructive",
      });
      setFeedbackRetry(true);
      setFeedbackState((prev) => ({ ...prev, submitting: false }));
    }
  };

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
              <p className="text-sm text-muted-foreground">Update your profile, manage billing, and connect partner tools.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <LogOut className="mr-2 h-4 w-4" />Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        {profileRetry && (
          <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>We couldn't sync your profile. Check your connection and try again.</span>
            <Button variant="outline" size="sm" onClick={loadProfile}>
              Retry load
            </Button>
          </div>
        )}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">Tune the basics that power your budget presets.</p>
            </div>
            <Button onClick={handleProfileSave} disabled={profileSaving || profileLoading}>
              {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {profileSaving ? "Saving" : "Save changes"}
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
            <div className="md:col-span-2 flex items-center justify-between rounded-xl border-2 border-dashed p-4">
              <div>
                <Label className="text-base">Travel with coach?</Label>
                <p className="text-sm text-muted-foreground">Switch on to include travel costs for your coach.</p>
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
              <Button variant="gold" onClick={handleUpgrade}>Upgrade to Pro</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Quick expense capture</h2>
            <p className="text-sm text-muted-foreground">
              Log on-the-go expenses so your active budget reflects real spend immediately.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleExpenseSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Budget</Label>
                <Select value={expenseForm.budgetId} onValueChange={(value) => handleExpenseFieldChange("budgetId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.title}
                        {budget.is_active ? " • Active" : ""}
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
                  onChange={(event) => handleExpenseFieldChange("category", event.target.value)}
                  placeholder="Travel, strings, physio..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input
                  id="expense-amount"
                  inputMode="decimal"
                  value={expenseForm.amount}
                  onChange={(event) => handleExpenseFieldChange("amount", event.target.value)}
                  placeholder="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-currency">Currency</Label>
                <Input
                  id="expense-currency"
                  value={expenseForm.currency}
                  onChange={(event) => handleExpenseFieldChange("currency", event.target.value)}
                  maxLength={3}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expense-note">Notes</Label>
                <Textarea
                  id="expense-note"
                  rows={3}
                  value={expenseForm.note}
                  onChange={(event) => handleExpenseFieldChange("note", event.target.value)}
                  placeholder="Optional context for the spend"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={expenseSaving || !expenseForm.category.trim() || !expenseForm.amount.trim()}
              >
                {expenseSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save expense
              </Button>
              <Button type="button" variant="outline" onClick={loadExpenseEntries} disabled={expenseLoading}>
                {expenseLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Refresh list
              </Button>
              <Button type="button" variant="outline" onClick={handleLaunchPlayerX}>
                Launch Player X
              </Button>
              <Button type="button" variant="outline" onClick={handleVisitWolfPro}>
                Visit WolfPro
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Recent entries</h3>
            {expenseLoading ? (
              <p className="text-xs text-muted-foreground">Loading expenses…</p>
            ) : expenseEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quick expenses yet. Add one after each purchase on tour.</p>
            ) : (
              <div className="space-y-2">
                {expenseEntries.map((entry) => {
                  const budgetLabel = entry.budget_id ? budgetNameById.get(entry.budget_id) ?? "Budget" : "Personal";
                  const timestamp = entry.created_at
                    ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })
                    : "Just now";
                  return (
                    <Card key={entry.id} className="border border-muted-foreground/20 bg-card/60 px-4 py-3">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{entry.category}</span>
                          <span className="font-semibold">
                            {formatCurrency(Number(entry.amount ?? 0), entry.currency ?? expenseForm.currency)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                          <span>{budgetLabel}</span>
                          <span>{timestamp}</span>
                        </div>
                        {entry.note ? <p className="text-xs text-muted-foreground">{entry.note}</p> : null}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Feedback & Support</h2>
            <p className="text-sm text-muted-foreground">Share ideas or reach the team directly.</p>
          </div>
          {feedbackRetry && (
            <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span>Feedback wasn’t sent. Check your connection and try again.</span>
              <Button variant="outline" size="sm" onClick={() => {
                setFeedbackRetry(false);
              }}>
                Dismiss
              </Button>
            </div>
          )}
          <form className="grid gap-4" onSubmit={handleSubmitFeedback}>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={feedbackState.topic}
                  onChange={(event) => setFeedbackState((prev) => ({ ...prev, topic: event.target.value }))}
                  placeholder="Sponsorship decks, new features..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-email">Reply-to email</Label>
                <Input
                  id="feedback-email"
                  type="email"
                  value={feedbackState.email}
                  onChange={(event) => setFeedbackState((prev) => ({ ...prev, email: event.target.value }))}
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
                onChange={(event) => setFeedbackState((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Tell us what would make Player's Budget better for you."
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={feedbackState.submitting}>
                {feedbackState.submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {feedbackState.submitting ? "Sending" : "Share feedback"}
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:team@wolfprocommunity.com?subject=Player%20Budget%20Support">Contact support</a>
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
