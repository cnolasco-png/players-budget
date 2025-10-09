// Financial calculation utilities for tennis player budgets
// Pure functions for easy testing and reliability

/**
 * Calculate the funding gap between planned costs and secured funds
 */
export function calcFundingGap(
  plannedCost: number,
  cashOnHand: number,
  sponsorCommitted: number,
  incomeConfirmed: number
): number {
  const totalSecured = cashOnHand + sponsorCommitted + incomeConfirmed;
  return Math.max(0, plannedCost - totalSecured);
}

/**
 * Calculate envelope health metrics for budget categories
 */
export function calcEnvelopeHealth(
  cap: number,
  spent: number,
  daysLeft: number
): { remaining: number; dailyAllowance: number } {
  const remaining = Math.max(0, cap - spent);
  const dailyAllowance = daysLeft > 0 ? remaining / daysLeft : 0;
  
  return {
    remaining,
    dailyAllowance
  };
}

/**
 * Calculate forecast at completion based on current performance
 */
export function calcForecastAtCompletion(
  actualToDate: number,
  remainingPlan: number,
  projectedIncome: number
): number {
  return actualToDate + remainingPlan + projectedIncome;
}

/**
 * Calculate cash runway in weeks
 */
export function calcCashRunway(
  availableCash: number,
  avgDailyBurn: number
): number {
  if (avgDailyBurn <= 0) return 0;
  const daysOfCash = availableCash / avgDailyBurn;
  return daysOfCash / 7; // Convert to weeks
}

/**
 * Standard ATP/WTA prize money tables by tournament category
 */
const PRIZE_TABLES = {
  'Grand Slam': {
    'R128': 100000, 'R64': 180000, 'R32': 290000, 'R16': 490000,
    'QF': 910000, 'SF': 1700000, 'F': 3150000, 'W': 6200000
  },
  'Masters 1000': {
    'R64': 22000, 'R32': 39000, 'R16': 69000, 'QF': 127000,
    'SF': 243000, 'F': 459000, 'W': 875000
  },
  'ATP 500': {
    'R32': 15000, 'R16': 26000, 'QF': 47000, 'SF': 89000,
    'F': 166000, 'W': 315000
  },
  'ATP 250': {
    'R32': 7500, 'R16': 13000, 'QF': 23000, 'SF': 43000,
    'F': 79000, 'W': 150000
  },
  'WTA 1000': {
    'R64': 12000, 'R32': 22000, 'R16': 41000, 'QF': 73000,
    'SF': 140000, 'F': 265000, 'W': 500000
  },
  'WTA 500': {
    'R32': 8500, 'R16': 15000, 'QF': 27000, 'SF': 50000,
    'F': 93000, 'W': 175000
  },
  'WTA 250': {
    'R32': 4200, 'R16': 7000, 'QF': 12000, 'SF': 22000,
    'F': 41000, 'W': 76000
  },
  'Challenger': {
    'R32': 800, 'R16': 1200, 'QF': 2100, 'SF': 3600,
    'F': 6100, 'W': 10300
  },
  'ITF': {
    'R32': 150, 'R16': 250, 'QF': 400, 'SF': 650,
    'F': 1000, 'W': 1600
  }
};

/**
 * Calculate which round a player needs to reach to break even (after taxes)
 */
export function calcBreakEvenRound(
  tournamentCategory: keyof typeof PRIZE_TABLES,
  taxPct: number,
  plannedBudget: number
): string {
  const prizeTable = PRIZE_TABLES[tournamentCategory];
  if (!prizeTable) return 'Unknown tournament category';

  // Sort rounds by prize money (ascending)
  const rounds = Object.entries(prizeTable)
    .sort(([, a], [, b]) => a - b);

  for (const [round, prizeMoney] of rounds) {
    const afterTaxPrize = prizeMoney * (1 - taxPct / 100);
    if (afterTaxPrize >= plannedBudget) {
      return round;
    }
  }

  return 'Winner required'; // Budget exceeds winner prize
}

/**
 * Get estimated per diem rates by city and circuit
 * TODO: Implement with real data from tournament locations
 */
export function getCityPerDiem(city: string, circuit: 'ATP' | 'WTA' | 'Challenger' | 'ITF'): number {
  // TODO: Integrate with real per diem data
  // Consider factors like:
  // - Cost of living index
  // - Tournament location (hotel proximity)
  // - Circuit level (different accommodation standards)
  // - Seasonal variations
  
  const basePerdiem = {
    'ATP': 150,      // Higher standard for main tour
    'WTA': 140,      // Similar to ATP
    'Challenger': 80, // More budget-conscious
    'ITF': 50        // Basic accommodation
  };

  // City multipliers (placeholder - replace with real data)
  const cityMultipliers: Record<string, number> = {
    'monaco': 2.5,
    'london': 2.0,
    'new york': 2.0,
    'paris': 1.8,
    'melbourne': 1.6,
    'dubai': 1.5,
    'miami': 1.4,
    'indian wells': 1.3,
    'madrid': 1.2,
    'rome': 1.1,
    'cincinnati': 1.0,
    'toronto': 1.0,
    'default': 1.0
  };

  const multiplier = cityMultipliers[city.toLowerCase()] || cityMultipliers.default;
  return Math.round(basePerdiem[circuit] * multiplier);
}

/**
 * Get tax percentage by country for tennis prize money
 * TODO: Implement with real tax data and professional tax advice
 */
export function getTaxPct(country: string): number {
  // TODO: Implement comprehensive tax calculations
  // This requires:
  // - Country-specific tax rates
  // - Double taxation treaty considerations
  // - Professional athlete specific rules
  // - Withholding tax variations by tournament location
  // - Income threshold considerations
  
  // Placeholder rates - ALWAYS consult tax professionals
  const taxRates: Record<string, number> = {
    'US': 37,     // Federal + state (varies by state)
    'GB': 45,     // UK higher rate
    'FR': 45,     // French top rate
    'ES': 47,     // Spanish top rate
    'IT': 43,     // Italian top rate
    'DE': 42,     // German top rate
    'AU': 45,     // Australian top rate
    'CA': 53,     // Combined federal + provincial (varies)
    'CH': 11.5,   // Swiss federal (varies by canton)
    'MC': 0,      // Monaco (resident only)
    'default': 30 // Conservative estimate
  };

  return taxRates[country.toUpperCase()] || taxRates.default;
}

/**
 * Calculate monthly burn rate from expense history
 */
export function calcMonthlyBurnRate(expenses: Array<{ amount: number; date: string }>): number {
  if (expenses.length === 0) return 0;

  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

  const recentExpenses = expenses.filter(expense => 
    new Date(expense.date) >= threeMonthsAgo
  );

  if (recentExpenses.length === 0) return 0;

  const totalExpenses = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthsOfData = Math.max(1, (now.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return totalExpenses / monthsOfData;
}

/**
 * Calculate tournament ROI (Return on Investment)
 */
export function calcTournamentROI(
  prizeMoney: number,
  expenses: number,
  taxPct: number = 0
): { roi: number; netProfit: number; roiPercentage: number } {
  const afterTaxPrize = prizeMoney * (1 - taxPct / 100);
  const netProfit = afterTaxPrize - expenses;
  const roi = expenses > 0 ? netProfit / expenses : 0;
  const roiPercentage = roi * 100;

  return {
    roi,
    netProfit,
    roiPercentage
  };
}

/**
 * Validate financial inputs
 */
export function validateFinancialInput(value: number, field: string): string | null {
  if (isNaN(value) || !isFinite(value)) {
    return `${field} must be a valid number`;
  }
  if (value < 0) {
    return `${field} cannot be negative`;
  }
  return null;
}

/**
 * Format financial metrics for display
 */
export function formatFinancialMetric(
  value: number, 
  type: 'currency' | 'percentage' | 'days' | 'weeks',
  currency = 'USD'
): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(value);
    
    case 'percentage':
      return `${value.toFixed(1)}%`;
    
    case 'days':
      return `${Math.round(value)} days`;
    
    case 'weeks':
      return `${value.toFixed(1)} weeks`;
    
    default:
      return value.toString();
  }
}
