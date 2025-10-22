import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "players-budget:fmsa-prework";

const newId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export type CurrencyAmount = {
  currency: string;
  amount: number;
};

export type AccountSnapshot = {
  id: string;
  account: string;
  currency: string;
  balance: number;
  notes?: string;
};

export type DebtSnapshot = {
  id: string;
  type: string;
  lender: string;
  balance: number;
  apr: number;
  monthly: number;
  endDate?: string;
};

export type FixedCost = {
  id: string;
  label: string;
  amount: number;
  currency?: string;
};

export type ScheduleEntry = {
  id: string;
  month: string;
  region: string;
  events: string;
  priority: "A" | "B" | "C";
  notes?: string;
};

export type IncomeEntry = {
  id: string;
  stream: string;
  gross: number;
  withholding: number;
  net: number;
  currency?: string;
};

export type BeliefEntry = {
  id: string;
  belief: string;
  reframe?: string;
  helpful: boolean;
};

export type StressTriggerEntry = {
  id: string;
  trigger: string;
  response: string;
};

export type FMSAPreworkState = {
  accounts: AccountSnapshot[];
  debts: DebtSnapshot[];
  fixedCosts: FixedCost[];
  variableNotes: string;
  schedule: ScheduleEntry[];
  income: IncomeEntry[];
  beliefs: BeliefEntry[];
  stressTriggers: StressTriggerEntry[];
  lastUpdated: string;
};

const DEFAULT_STATE: FMSAPreworkState = {
  accounts: [
    { id: newId(), account: "Revolut", currency: "EUR", balance: 1240, notes: "Travel pot" },
    { id: newId(), account: "Chase Checking", currency: "USD", balance: 2180, notes: "Living" },
  ],
  debts: [
    { id: newId(), type: "Credit card", lender: "Amex", balance: 1150, apr: 24.9, monthly: 85 },
    { id: newId(), type: "Travel loan", lender: "Local bank", balance: 2700, apr: 8.5, monthly: 98, endDate: "2027-06" },
  ],
  fixedCosts: [
    { id: newId(), label: "Housing", amount: 650, currency: "USD" },
    { id: newId(), label: "Phone", amount: 40, currency: "USD" },
    { id: newId(), label: "Insurance", amount: 110, currency: "USD" },
  ],
  variableNotes:
    "Meals €18–28 (EU); stringing $12–25; physio $30–90. Adjust after first swing.",
  schedule: [
    {
      id: newId(),
      month: "Feb",
      region: "Spain (EU)",
      events: "2× W15",
      priority: "B",
      notes: "Share apt, cook",
    },
    {
      id: newId(),
      month: "Mar",
      region: "USA (NA)",
      events: "1× W25 + 1 league wknd",
      priority: "A",
      notes: "Clinic on off-day",
    },
  ],
  income: [
    { id: newId(), stream: "Prize money", gross: 4200, withholding: 420, net: 3780 },
    { id: newId(), stream: "Clinics (12)", gross: 3000, withholding: 120, net: 2880 },
  ],
  beliefs: [
    { id: newId(), belief: "If I don’t travel every week, I’m falling behind.", reframe: "Run ROI rules; Green runway first.", helpful: false },
    { id: newId(), belief: "Clinics fund performance blocks — that’s pro behaviour.", helpful: true },
  ],
  stressTriggers: [
    { id: newId(), trigger: "Low cash before a trip", response: "Run Go/No-Go, add clinic, delay week." },
    { id: newId(), trigger: "Unexpected expense", response: "Use contingency line, claim insurance, host housing." },
  ],
  lastUpdated: new Date().toISOString(),
};

function loadState(): FMSAPreworkState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as FMSAPreworkState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      accounts: parsed.accounts?.length ? parsed.accounts : DEFAULT_STATE.accounts,
      debts: parsed.debts?.length ? parsed.debts : DEFAULT_STATE.debts,
      fixedCosts: parsed.fixedCosts?.length ? parsed.fixedCosts : DEFAULT_STATE.fixedCosts,
      schedule: parsed.schedule?.length ? parsed.schedule : DEFAULT_STATE.schedule,
      income: parsed.income?.length ? parsed.income : DEFAULT_STATE.income,
      beliefs: parsed.beliefs?.length ? parsed.beliefs : DEFAULT_STATE.beliefs,
      stressTriggers: parsed.stressTriggers?.length ? parsed.stressTriggers : DEFAULT_STATE.stressTriggers,
      variableNotes: parsed.variableNotes ?? DEFAULT_STATE.variableNotes,
    };
  } catch (error) {
    console.warn("Failed to parse FMSA prework cache", error);
    return DEFAULT_STATE;
  }
}

function persistState(state: FMSAPreworkState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist FMSA prework", error);
  }
}

export function useFMSAPrework() {
  const [state, setState] = useState<FMSAPreworkState>(DEFAULT_STATE);

  useEffect(() => {
    setState(loadState());
  }, []);

  const updateState = (updater: (prev: FMSAPreworkState) => FMSAPreworkState) => {
    setState((prev) => {
      const next = updater(prev);
      const stamped = { ...next, lastUpdated: new Date().toISOString() };
      persistState(stamped);
      return stamped;
    });
  };

  const addAccount = () =>
    updateState((prev) => ({
      ...prev,
      accounts: [...prev.accounts, { id: newId(), account: "", currency: "USD", balance: 0 }],
    }));

  const updateAccount = (id: string, update: Partial<AccountSnapshot>) =>
    updateState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));

  const removeAccount = (id: string) =>
    updateState((prev) => ({ ...prev, accounts: prev.accounts.filter((item) => item.id !== id) }));

  const addDebt = () =>
    updateState((prev) => ({
      ...prev,
      debts: [...prev.debts, { id: newId(), type: "", lender: "", balance: 0, apr: 0, monthly: 0 }],
    }));

  const updateDebt = (id: string, update: Partial<DebtSnapshot>) =>
    updateState((prev) => ({
      ...prev,
      debts: prev.debts.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));

  const removeDebt = (id: string) =>
    updateState((prev) => ({ ...prev, debts: prev.debts.filter((item) => item.id !== id) }));

  const addFixedCost = () =>
    updateState((prev) => ({
      ...prev,
      fixedCosts: [...prev.fixedCosts, { id: newId(), label: "", amount: 0, currency: "USD" }],
    }));

  const updateFixedCost = (id: string, update: Partial<FixedCost>) =>
    updateState((prev) => ({
      ...prev,
      fixedCosts: prev.fixedCosts.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));

  const removeFixedCost = (id: string) =>
    updateState((prev) => ({ ...prev, fixedCosts: prev.fixedCosts.filter((item) => item.id !== id) }));

  const setVariableNotes = (notes: string) =>
    updateState((prev) => ({
      ...prev,
      variableNotes: notes,
    }));

  const addScheduleEntry = () =>
    updateState((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { id: newId(), month: "", region: "", events: "", priority: "B", notes: "" },
      ],
    }));

  const updateScheduleEntry = (id: string, update: Partial<ScheduleEntry>) =>
    updateState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));

  const removeScheduleEntry = (id: string) =>
    updateState((prev) => ({ ...prev, schedule: prev.schedule.filter((item) => item.id !== id) }));

  const addIncomeEntry = () =>
    updateState((prev) => ({
      ...prev,
      income: [
        ...prev.income,
        { id: newId(), stream: "", gross: 0, withholding: 0, net: 0, currency: "USD" },
      ],
    }));

  const updateIncomeEntry = (id: string, update: Partial<IncomeEntry>) =>
    updateState((prev) => ({
      ...prev,
      income: prev.income.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));

  const removeIncomeEntry = (id: string) =>
    updateState((prev) => ({ ...prev, income: prev.income.filter((item) => item.id !== id) }));

  const addBelief = (helpful: boolean) =>
    updateState((prev) => ({
      ...prev,
      beliefs: [...prev.beliefs, { id: newId(), belief: "", reframe: "", helpful }],
    }));

  const updateBelief = (id: string, update: Partial<BeliefEntry>) =>
    updateState((prev) => ({
      ...prev,
      beliefs: prev.beliefs.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));

  const removeBelief = (id: string) =>
    updateState((prev) => ({ ...prev, beliefs: prev.beliefs.filter((item) => item.id !== id) }));

  const addStressTrigger = () =>
    updateState((prev) => ({
      ...prev,
      stressTriggers: [...prev.stressTriggers, { id: newId(), trigger: "", response: "" }],
    }));

  const updateStressTrigger = (id: string, update: Partial<StressTriggerEntry>) =>
    updateState((prev) => ({
      ...prev,
      stressTriggers: prev.stressTriggers.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));

  const removeStressTrigger = (id: string) =>
    updateState((prev) => ({ ...prev, stressTriggers: prev.stressTriggers.filter((item) => item.id !== id) }));

  const resetState = () => {
    const reset = { ...DEFAULT_STATE, lastUpdated: new Date().toISOString() };
    setState(reset);
    persistState(reset);
  };

  const totals = useMemo(() => {
    const fixed = state.fixedCosts.reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0);
    const gross = state.income.reduce((sum, entry) => sum + (Number(entry.gross) || 0), 0);
    const net = state.income.reduce((sum, entry) => sum + (Number(entry.net) || 0), 0);
    return { fixed, gross, net };
  }, [state.fixedCosts, state.income]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fmsa-starting-line-${todayISO()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportText = () => {
    const lines = [
      `Starting Line Snapshot — ${new Date(state.lastUpdated).toLocaleDateString()}`,
      "",
      "Accounts:",
      ...state.accounts.map(
        (account) =>
          `• ${account.account} — ${account.currency} ${account.balance.toLocaleString()}${
            account.notes ? ` (${account.notes})` : ""
          }`,
      ),
      "",
      "Debts & Loans:",
      ...state.debts.map(
        (debt) =>
          `• ${debt.type} / ${debt.lender} — ${debt.balance.toLocaleString()} @ ${debt.apr}% · Monthly ${debt.monthly}${
            debt.endDate ? ` · Ends ${debt.endDate}` : ""
          }`,
      ),
      "",
      `Monthly fixed costs: ${totals.fixed.toLocaleString()}`,
      "",
      "Season schedule:",
      ...state.schedule.map(
        (entry) =>
          `• ${entry.month} — ${entry.region} · ${entry.events} · Priority ${entry.priority}${
            entry.notes ? ` (${entry.notes})` : ""
          }`,
      ),
      "",
      "Income last 12 months:",
      ...state.income.map(
        (entry) =>
          `• ${entry.stream}: Gross ${entry.gross.toLocaleString()} · Net ${entry.net.toLocaleString()}${
            entry.currency ? ` ${entry.currency}` : ""
          }`,
      ),
      "",
      "Beliefs:",
      ...state.beliefs.map((entry) =>
        entry.helpful
          ? `✔ Helpful: ${entry.belief}`
          : `✘ Unhelpful: ${entry.belief}${entry.reframe ? ` → Reframe: ${entry.reframe}` : ""}`,
      ),
      "",
      "Stress triggers:",
      ...state.stressTriggers.map((entry) => `• ${entry.trigger} → ${entry.response}`),
      "",
      "Variable spend notes:",
      state.variableNotes,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fmsa-starting-line-${todayISO()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    state,
    totals,
    addAccount,
    updateAccount,
    removeAccount,
    addDebt,
    updateDebt,
    removeDebt,
    addFixedCost,
    updateFixedCost,
    removeFixedCost,
    setVariableNotes,
    addScheduleEntry,
    updateScheduleEntry,
    removeScheduleEntry,
    addIncomeEntry,
    updateIncomeEntry,
    removeIncomeEntry,
    addBelief,
    updateBelief,
    removeBelief,
    addStressTrigger,
    updateStressTrigger,
    removeStressTrigger,
    resetState,
    exportJson,
    exportText,
  };
}
