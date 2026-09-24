import { apiClient } from "@/shared/api"

export interface AdminOverview {
  users: number
  new_users_7d: number
  businesses: number
  welcome_claims: number
  credits_available: number
  credits_spent: number
  videos_failed: number
  rag_answers: number
}

export interface AdminUser {
  id: string
  email: string
  status: string
  email_verified: boolean
  created_at: string
  last_login_at: string | null
}

export interface AdminUserDetail extends AdminUser {
  active_sessions: number
  businesses: Array<{
    id: string
    name: string
    role: string
    credits: number
    tier: string
  }>
}

export interface AdminCatalog {
  settings: Record<string, string>
  rates: Array<{
    code: string
    credits_per_unit: number
    units_per_charge: number
    version: number
  }>
  plans: Array<{
    code: string
    monthly_price_cents: number
    credits_per_month: number
    yearly_discount_bps: number
    active: boolean
  }>
  packs: Array<{
    id: string
    code: string
    title: string
    price_cents: number
    credits: number
    active: boolean
    sort_order: number
  }>
}

export interface AdminActivity {
  id: string
  action: string
  resource_type: string
  resource_id: string | null
  business_id: string | null
  occurred_at: string
}

export const platformAdminApi = {
  me: () => apiClient.get<{ is_admin: boolean; email: string }>("/admin/me"),
  overview: () => apiClient.get<AdminOverview>("/admin/overview"),
  activity: () => apiClient.get<AdminActivity[]>("/admin/activity"),
  users: (search = "") =>
    apiClient.get<{ total: number; items: AdminUser[] }>("/admin/users", {
      params: { search, limit: 50 },
    }),
  user: (id: string) => apiClient.get<AdminUserDetail>(`/admin/users/${id}`),
  userStatus: (id: string, status: "active" | "suspended", reason: string) =>
    apiClient.patch<{ id: string; status: string }>(
      `/admin/users/${id}/status`,
      {
        status,
        reason,
      }
    ),
  entitlement: (businessId: string, tier: "free" | "pro", reason: string) =>
    apiClient.patch(`/admin/businesses/${businessId}/entitlement`, {
      tier,
      reason,
    }),
  catalog: () => apiClient.get<AdminCatalog>("/admin/billing/catalog"),
  setting: (key: string, value: string, reason: string) =>
    apiClient.put(`/admin/billing/settings/${key}`, { value, reason }),
  rate: (
    code: string,
    creditsPerUnit: number,
    unitsPerCharge: number,
    reason: string
  ) =>
    apiClient.put(`/admin/billing/rates/${code}`, {
      credits_per_unit: creditsPerUnit,
      units_per_charge: unitsPerCharge,
      reason,
    }),
  plan: (
    code: string,
    input: {
      monthly_price_cents: number
      credits_per_month: number
      yearly_discount_bps: number
      active: boolean
      reason: string
    }
  ) => apiClient.patch(`/admin/billing/plans/${code}`, input),
  createPack: (input: {
    code: string
    title: string
    price_cents: number
    credits: number
    active: boolean
    sort_order: number
    reason: string
  }) =>
    apiClient.post<{ id: string; code: string }>("/admin/billing/packs", input),
  updatePack: (id: string, input: Record<string, string | number | boolean>) =>
    apiClient.patch(`/admin/billing/packs/${id}`, input),
}
