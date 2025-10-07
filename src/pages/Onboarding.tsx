import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "MX", name: "Mexico" },
  { code: "CA", name: "Canada" },
];

const CURRENCIES = ["USD", "EUR", "GBP"];
const PLAYER_LEVELS = ["Junior", "College", "ITF", "Challenger", "ATP-WTA"];

const profileSchema = z.object({
  country: z.string().min(1, "Select a country"),
  currency: z.string().min(1, "Select a currency"),
  playerLevel: z.string().min(1, "Select a player level"),
  travelsWithCoach: z.boolean().optional().default(false),
});

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [shouldRetryOnboarding, setShouldRetryOnboarding] = useState(false);

  // Step 2: Scenario presets
  const [selectedPreset, setSelectedPreset] = useState("Standard");
  const [nightsPerTournament, setNightsPerTournament] = useState([7]);
  const [tournamentsPerMonth, setTournamentsPerMonth] = useState([4]);
  const [coachDaysPerMonth, setCoachDaysPerMonth] = useState([0]);
  const [airfarePerLeg, setAirfarePerLeg] = useState([300]);
  const [mealsPerDay, setMealsPerDay] = useState([50]);

  // Step 3: Budget details
  const [budgetTitle, setBudgetTitle] = useState("");
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear() + 1);

  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      country: "",
      currency: "USD",
      playerLevel: "",
      travelsWithCoach: false,
    },
  });

  const watchCountry = form.watch("country");
  const watchCurrency = form.watch("currency");
  const watchPlayerLevel = form.watch("playerLevel");
  const watchTravelsWithCoach = form.watch("travelsWithCoach");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setBudgetTitle(`${new Date().getFullYear() + 1} Season Budget`);
    })();
  }, [navigate]);

  const applyPreset = (preset: string) => {
    setSelectedPreset(preset);

    switch (preset) {
      case "Lean":
        setNightsPerTournament([5]);
        setTournamentsPerMonth([3]);
        setCoachDaysPerMonth([0]);
        setAirfarePerLeg([200]);
        setMealsPerDay([30]);
        break;
      case "Standard":
        setNightsPerTournament([7]);
        setTournamentsPerMonth([4]);
        setCoachDaysPerMonth([watchTravelsWithCoach ? 8 : 0]);
        setAirfarePerLeg([300]);
        setMealsPerDay([50]);
        break;
      case "Premium":
        setNightsPerTournament([10]);
        setTournamentsPerMonth([5]);
        setCoachDaysPerMonth([watchTravelsWithCoach ? 15 : 0]);
        setAirfarePerLeg([500]);
        setMealsPerDay([75]);
        break;
    }
  };

  const handleNext = (nextStep?: number) => {
    if (step === 1) {
      form.handleSubmit(() => setStep(nextStep ?? step + 1))();
      return;
    }

    setStep(nextStep ?? step + 1);
  };

  const handleBack = () => setStep(Math.max(step - 1, 1));

  const handleComplete = form.handleSubmit(async (profileValues) => {
    setLoading(true);
    setShouldRetryOnboarding(false);

    let createdBudgetId: string | null = null;
    const createdScenarioIds: string[] = [];

    try {
      if (!user) return;

      const { country, currency, playerLevel, travelsWithCoach = false } = profileValues;

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          country,
          home_currency: currency,
          player_level: playerLevel,
          travels_with_coach: travelsWithCoach,
        });

      if (profileError) throw profileError;

      const { data: taxRateData } = await supabase
        .from("tax_rates")
        .select("default_pct")
        .eq("country", country)
        .single();

      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .insert({
          user_id: user.id,
          title: budgetTitle,
          season_year: seasonYear,
          base_currency: currency,
          tax_country: country,
          tax_pct: taxRateData?.default_pct || 0,
        })
        .select()
        .single();

      if (budgetError || !budgetData) throw budgetError ?? new Error("Budget not created");

      createdBudgetId = budgetData.id;

      const scenarios = [
        { name: "Lean", multiplier: 0.7 },
        { name: "Standard", multiplier: 1.0 },
        { name: "Premium", multiplier: 1.3 },
      ];

      for (const scenario of scenarios) {
        const { data: scenarioData, error: scenarioError } = await supabase
          .from("scenarios")
          .insert({
            budget_id: budgetData.id,
            name: scenario.name,
            description: `${scenario.name} budget scenario`,
            is_default: scenario.name === "Standard",
            nights_per_tournament: Math.round(nightsPerTournament[0] * scenario.multiplier),
            tournaments_per_month: Math.round(tournamentsPerMonth[0] * scenario.multiplier),
            coach_days_per_month: Math.round(coachDaysPerMonth[0] * scenario.multiplier),
            airfare_per_leg: airfarePerLeg[0] * scenario.multiplier,
            meals_per_day: mealsPerDay[0] * scenario.multiplier,
          })
          .select()
          .single();

        if (scenarioError || !scenarioData) throw scenarioError ?? new Error("Scenario not created");

        createdScenarioIds.push(scenarioData.id);

        const { data: categories } = await supabase
          .from("line_item_categories")
          .select("*")
          .order("sort_order");

        if (categories) {
          for (const category of categories) {
            let qty = 1;
            let unitCost = 0;
            let unit = "flat_monthly";

            switch (category.kind) {
              case "Travel":
                qty = tournamentsPerMonth[0];
                unitCost = airfarePerLeg[0] * scenario.multiplier;
                unit = "per_tournament";
                break;
              case "Lodging":
                qty = nightsPerTournament[0] * tournamentsPerMonth[0] * scenario.multiplier;
                unitCost = 100 * scenario.multiplier;
                unit = "per_night";
                break;
              case "Meals":
                qty = 30;
                unitCost = mealsPerDay[0] * scenario.multiplier;
                unit = "per_day";
                break;
              case "Entry Fees":
                qty = tournamentsPerMonth[0];
                unitCost = 100 * scenario.multiplier;
                unit = "per_tournament";
                break;
              case "Coaching":
                if (travelsWithCoach && coachDaysPerMonth[0] > 0) {
                  qty = coachDaysPerMonth[0] * scenario.multiplier;
                  unitCost = 200 * scenario.multiplier;
                  unit = "per_day";
                }
                break;
            }

            await supabase.from("line_items").insert({
              scenario_id: scenarioData.id,
              category_id: category.id,
              label: category.label,
              qty,
              unit,
              unit_cost: unitCost,
              currency,
            });
          }
        }
      }

      toast({
        title: "Budget created!",
        description: "Your season budget is ready. Let's review the details.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating budget:", error);

      toast({
        title: "Error creating budget",
        description: `${error.message ?? "Something went wrong"}. Check your internet connection and try again.`,
        variant: "destructive",
      });
      setShouldRetryOnboarding(true);

      // Attempt rollback so user can retry without duplicates
      try {
        if (createdScenarioIds.length) {
          await supabase.from("line_items").delete().in("scenario_id", createdScenarioIds);
          await supabase.from("scenarios").delete().in("id", createdScenarioIds);
        }
        if (createdBudgetId) {
          await supabase.from("budgets").delete().eq("id", createdBudgetId);
        }
      } catch (rollbackError) {
        console.error("Rollback failed", rollbackError);
      }
    } finally {
      setLoading(false);
    }
  });

  const retryOnboarding = () => {
    setShouldRetryOnboarding(false);
    void handleComplete();
  };

  const stepOneError = useMemo(() => {
    const { country, playerLevel } = form.formState.errors;
    if (country) return country.message;
    if (playerLevel) return playerLevel.message;
    return null;
  }, [form.formState.errors]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-8 shadow-elegant">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">60-Second Setup</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? "w-12 gradient-primary" : s < step ? "w-8 bg-accent" : "w-8 bg-muted"
                }`}
              />
            ))}
          </div>

          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </div>

        {shouldRetryOnboarding && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>We couldn’t finish creating your budget. Check your connection and try again.</span>
            <Button variant="outline" size="sm" onClick={retryOnboarding} disabled={loading}>
              Retry setup
            </Button>
          </div>
        )}

        {step === 1 && (
          <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Profile</h3>
              <p className="text-sm text-muted-foreground">Tell us a bit about your season so we can personalize your presets.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Country of Residence</Label>
                <Select
                  value={watchCountry}
                  onValueChange={(value) => form.setValue("country", value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.country && (
                  <p className="text-xs text-destructive">{form.formState.errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Home Currency</Label>
                <Select
                  value={watchCurrency}
                  onValueChange={(value) => form.setValue("currency", value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.currency && (
                  <p className="text-xs text-destructive">{form.formState.errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Player Level</Label>
                <Select
                  value={watchPlayerLevel}
                  onValueChange={(value) => form.setValue("playerLevel", value, { shouldValidate: true })}
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
                {form.formState.errors.playerLevel && (
                  <p className="text-xs text-destructive">{form.formState.errors.playerLevel.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border-2 p-4">
                <div>
                  <Label>Travel with coach?</Label>
                  <p className="text-sm text-muted-foreground">Include coaching costs</p>
                </div>
                <Switch
                  checked={watchTravelsWithCoach}
                  onCheckedChange={(checked) => form.setValue("travelsWithCoach", checked, { shouldValidate: true })}
                />
              </div>
            </div>

            {stepOneError && <p className="text-sm text-destructive">{stepOneError}</p>}

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={() => handleNext(step + 1)}
                disabled={loading || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Checking..." : "Continue"}
                {form.formState.isSubmitting ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="ml-2 h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Scenario Settings</h3>
              <p className="text-sm text-muted-foreground">Choose a preset or customize your default assumptions. You can adjust these later.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {["Lean", "Standard", "Premium"].map((preset) => (
                <Button
                  key={preset}
                  variant={selectedPreset === preset ? "default" : "outline"}
                  onClick={() => applyPreset(preset)}
                  className="h-auto py-4"
                >
                  <div className="text-center">
                    <div className="font-semibold">{preset}</div>
                    <div className="mt-1 text-xs opacity-80">
                      {preset === "Lean" && "Budget-conscious"}
                      {preset === "Standard" && "Balanced approach"}
                      {preset === "Premium" && "Full support"}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="space-y-6">
              <SliderCard
                label="Nights per tournament"
                value={nightsPerTournament}
                onChange={setNightsPerTournament}
                min={3}
                max={14}
                step={1}
              />

              <SliderCard
                label="Tournaments per month"
                value={tournamentsPerMonth}
                onChange={setTournamentsPerMonth}
                min={1}
                max={8}
                step={1}
              />

              {watchTravelsWithCoach && (
                <SliderCard
                  label="Coach days per month"
                  value={coachDaysPerMonth}
                  onChange={setCoachDaysPerMonth}
                  min={0}
                  max={30}
                  step={1}
                />
              )}

              <SliderCard
                label={`Airfare per leg (${watchCurrency})`}
                value={airfarePerLeg}
                onChange={setAirfarePerLeg}
                min={100}
                max={1000}
                step={50}
              />

              <SliderCard
                label={`Meals per day (${watchCurrency})`}
                value={mealsPerDay}
                onChange={setMealsPerDay}
                min={20}
                max={150}
                step={5}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-5 w-5" />Back
              </Button>
              <Button size="lg" onClick={() => handleNext(step + 1)} disabled={loading}>
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Almost done!</h3>
              <p className="text-sm text-muted-foreground">Name your budget. We'll create Lean, Standard, and Premium scenarios using your presets.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Budget Title</Label>
                <Input value={budgetTitle} onChange={(event) => setBudgetTitle(event.target.value)} placeholder="e.g., 2026 Season Budget" />
              </div>

              <div className="space-y-2">
                <Label>Season Year</Label>
                <Input type="number" value={seasonYear} onChange={(event) => setSeasonYear(parseInt(event.target.value) || seasonYear)} />
              </div>
            </div>

            <Card className="border-accent/20 bg-accent/5 p-6">
              <h4 className="mb-3 flex items-center gap-2 font-semibold">
                <Check className="h-5 w-5 text-accent" />
                What happens next
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Your profile will be saved</li>
                <li>✓ We'll create a budget with 3 scenarios</li>
                <li>✓ Each scenario includes pre-filled line items</li>
                <li>✓ You can edit everything in the dashboard</li>
              </ul>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                <ArrowLeft className="mr-2 h-5 w-5" />Back
              </Button>
              <Button size="lg" onClick={handleComplete} disabled={loading}>
                {loading ? (
                  <>
                    Creating...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Create Budget
                    <Check className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

interface SliderCardProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
}

const SliderCard = ({ label, value, onChange, min, max, step }: SliderCardProps) => (
  <div className="space-y-3">
    <div className="flex justify-between">
      <Label>{label}</Label>
      <span className="text-sm font-semibold">{value[0]}</span>
    </div>
    <Slider value={value} onValueChange={onChange} min={min} max={max} step={step} />
  </div>
);

export default Onboarding;
