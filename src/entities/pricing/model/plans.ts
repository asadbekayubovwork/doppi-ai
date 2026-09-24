/**
 * The public price list. Numbers live here, copy in `pricing.*` i18n keyed by
 * the ids below. There is no checkout yet: plan and pack buttons lead to
 * sign-up or to the sales form.
 */

/** What one credit is worth: the Starter plan's $20 buys 5 000 credits. */
export const CREDIT_PRICE_USD = 0.004

/** Yearly billing takes this share off every monthly price. */
export const YEARLY_DISCOUNT = 0.2

export type BillingPeriod = "monthly" | "yearly"

/** Keys of `pricing.badges`. */
export type PricingBadge = "popular" | "max" | "value"

export interface PlanFeature {
  /** Key under `pricing.plans.<plan>.features`. */
  id: string
  /** Features a plan lacks are listed crossed out, to show what an upgrade adds. */
  included: boolean
}

export interface Plan {
  id: "starter" | "pro" | "business"
  /** Monthly price in US dollars when billed month to month. */
  priceUsd: number
  /** Credits added every month, bonus included. */
  credits: number
  bonusPercent?: number
  badge?: PricingBadge
  /** The highlighted card: ink outline and a solid button. */
  featured?: boolean
  to: string
  features: PlanFeature[]
}

const included = (...ids: string[]): PlanFeature[] => ids.map((id) => ({ id, included: true }))
const missing = (...ids: string[]): PlanFeature[] => ids.map((id) => ({ id, included: false }))

export const PLANS: Plan[] = [
  {
    id: "starter",
    priceUsd: 20,
    credits: 5000,
    to: "/register",
    features: [
      ...included("voice", "rag", "files", "video", "instagram"),
      ...missing("watermark", "cloning"),
    ],
  },
  {
    id: "pro",
    priceUsd: 60,
    credits: 18000,
    bonusPercent: 20,
    badge: "popular",
    featured: true,
    to: "/register",
    features: included("voice", "rag", "files", "video", "planner", "instagram", "analytics"),
  },
  {
    id: "business",
    priceUsd: 150,
    credits: 50000,
    bonusPercent: 33,
    badge: "max",
    to: "/contact-us",
    features: included("voice", "rag", "video", "autopilot", "instagram", "crm", "priority"),
  },
]

/** The per-month price a plan shows for the chosen billing period. */
export const monthlyPrice = (plan: Plan, period: BillingPeriod) =>
  period === "yearly" ? plan.priceUsd * (1 - YEARLY_DISCOUNT) : plan.priceUsd

export interface CreditCost {
  /** Key under `pricing.costs.items`. */
  id: string
  icon: string
  /** Credits charged per unit; the unit is named in the copy. */
  credits: number
}

export const CREDIT_COSTS: CreditCost[] = [
  { id: "voice", icon: "phone-call", credits: 25 },
  { id: "rag", icon: "message-circle", credits: 5 },
  { id: "ragIndex", icon: "file-text", credits: 10 },
  { id: "videoSd", icon: "clapperboard", credits: 100 },
  { id: "videoHd", icon: "film", credits: 200 },
  { id: "planner", icon: "calendar-check", credits: 40 },
  { id: "autopost", icon: "bar-chart-3", credits: 5 },
]

export interface TopUpPack {
  /** Key under `pricing.topUp.packs`. */
  id: "mini" | "medium" | "pro"
  credits: number
  priceUsd: number
  badge?: PricingBadge
  featured?: boolean
}

/** One-off credits on top of a plan; unlike plan credits they never expire. */
export const TOP_UP_PACKS: TopUpPack[] = [
  { id: "mini", credits: 1000, priceUsd: 5 },
  { id: "medium", credits: 5000, priceUsd: 22, badge: "value" },
  { id: "pro", credits: 12000, priceUsd: 48, badge: "popular", featured: true },
]

/**
 * Dollar amounts in the one format the price list uses in every language:
 * "$20", "$22.00", "$0.0044". `cents` forces two decimals, as on pack prices;
 * four keep per-credit prices apart ($0.0044 against $0.004).
 */
export const formatUsd = (value: number, { cents = false } = {}) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: 4,
  }).format(value)
