const PRICE_IDS = {
  USD: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY_USD,
    yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY_USD,
  },
  EUR: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY_EUR,
    yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY_EUR,
  },
} as const;

type Currency = keyof typeof PRICE_IDS;
type BillingCycle = "monthly" | "yearly";

export function getStripePriceId(currency: Currency, billingCycle: BillingCycle) {
  return PRICE_IDS[currency]?.[billingCycle] ?? PRICE_IDS.USD.monthly;
}
