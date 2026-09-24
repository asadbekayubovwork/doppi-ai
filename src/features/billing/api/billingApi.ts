import { apiClient } from "@/shared/api"

export interface Wallet {
  business_id: string
  balance: number
  held: number
  available: number
  promo_remaining: number
  promo_expires_at: string | null
  tier: "free" | "pro"
}

export interface CreditLedgerEntry {
  id: string
  kind: string
  amount: number
  balance_after: number
  reason: string
  created_at: string
}

export interface UsageEntry {
  id: string
  service: "rag" | "rag_index" | "voice" | "video" | "planner" | "autopost"
  resource_id: string
  quantity: number
  unit: string
  rate_snapshot: number
  rate_denominator: number
  rate_version: number
  credits_charged: number
  occurred_at: string
}

export interface CreditRate {
  code: string
  credits_per_unit: number
  units_per_charge: number
  version: number
}

export interface CreditPack {
  id: string
  code: string
  title: string
  price_cents: number
  credits: number
}

export interface SubscriptionPlan {
  code: string
  monthly_price_cents: number
  credits_per_month: number
  yearly_discount_bps: number
}

export interface IntroOffer {
  credits: number
  days: number
  free_video_model: string
}

const root = (businessId: string) => `/businesses/${businessId}/billing`

export const billingApi = {
  wallet: (businessId: string) =>
    apiClient.get<Wallet>(`${root(businessId)}/wallet`),
  ledger: (businessId: string) =>
    apiClient.get<CreditLedgerEntry[]>(`${root(businessId)}/ledger`),
  usage: (businessId: string) =>
    apiClient.get<UsageEntry[]>(`${root(businessId)}/usage`),
  rates: () => apiClient.get<CreditRate[]>("/pricing/rates"),
  packs: () => apiClient.get<CreditPack[]>("/pricing/packs"),
  plans: () => apiClient.get<SubscriptionPlan[]>("/pricing/plans"),
  intro: () => apiClient.get<IntroOffer>("/pricing/intro"),
}
