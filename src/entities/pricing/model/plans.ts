/** Visual metadata only. All monetary values are served by the billing API. */
export type BillingPeriod = "monthly" | "yearly"
export type PricingBadge = "popular" | "max" | "value"

export interface PlanFeature {
  id: string
  included: boolean
}

export interface PlanDisplay {
  id: "starter" | "pro" | "business"
  badge?: PricingBadge
  featured?: boolean
  to: string
  features: PlanFeature[]
}

const included = (...ids: string[]): PlanFeature[] =>
  ids.map((id) => ({ id, included: true }))
const missing = (...ids: string[]): PlanFeature[] =>
  ids.map((id) => ({ id, included: false }))

export const PLAN_DISPLAY: PlanDisplay[] = [
  {
    id: "starter",
    to: "/contact-us",
    features: [
      ...included("voice", "rag", "files", "video", "instagram"),
      ...missing("watermark", "cloning"),
    ],
  },
  {
    id: "pro",
    badge: "popular",
    featured: true,
    to: "/contact-us",
    features: included(
      "voice",
      "rag",
      "files",
      "video",
      "planner",
      "instagram",
      "analytics"
    ),
  },
  {
    id: "business",
    badge: "max",
    to: "/contact-us",
    features: included(
      "voice",
      "rag",
      "video",
      "autopilot",
      "instagram",
      "crm",
      "priority"
    ),
  },
]

export interface CreditCostDisplay {
  id: string
  icon: string
  rateCode: string
}

export const CREDIT_COST_DISPLAY: CreditCostDisplay[] = [
  { id: "voice", icon: "phone-call", rateCode: "voice_minute" },
  { id: "rag", icon: "message-circle", rateCode: "rag_answer_bundle" },
  { id: "ragIndex", icon: "file-text", rateCode: "rag_index_file" },
  { id: "videoSd", icon: "clapperboard", rateCode: "video_sd_job" },
  { id: "videoHd", icon: "film", rateCode: "video_hd_job" },
  { id: "planner", icon: "calendar-check", rateCode: "planner_plan" },
  { id: "autopost", icon: "bar-chart-3", rateCode: "autopost_post" },
]

export const TOP_UP_DISPLAY: Record<
  string,
  { badge?: PricingBadge; featured?: boolean }
> = {
  medium: { badge: "value" },
  pro: { badge: "popular", featured: true },
}

export const monthlyPrice = (
  plan: { monthly_price_cents: number; yearly_discount_bps: number },
  period: BillingPeriod
) => {
  const cents =
    period === "yearly"
      ? Math.round(
          (plan.monthly_price_cents * (10_000 - plan.yearly_discount_bps)) /
            10_000
        )
      : plan.monthly_price_cents
  return cents / 100
}

export const formatUsd = (value: number, { cents = false } = {}) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: 4,
  }).format(value)
