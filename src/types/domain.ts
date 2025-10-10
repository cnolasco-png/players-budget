export interface ActivityEntry {
  id: string;
  kind: "expense" | "income";
  category?: string;
  amount: number;
  currency?: string;
  occurredAt: string | Date;
  note?: string;
  tripId?: string | null;
}

export interface ForecastRow {
  month: string;   // "2025-10"
  plannedIncome: number;
  plannedCost: number;
  net: number;
}
