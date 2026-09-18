import { apiClient, HttpError, type ApiProblem } from "@/shared/api"

interface AdminToken {
  access_token: string
  expires_in: number
}

export interface AdminModel {
  id: string
  display_name: string
  provider: string
  context_tokens: number
  input_usd_per_million: string | null
  output_usd_per_million: string | null
  currency: string
  enabled: boolean
  is_default: boolean
  capabilities: Record<string, unknown>
  sort_order: number
}

export interface AdminTenant {
  business_id: string
  tenant_name: string
  max_documents: number
  max_storage_bytes: number
  max_agents: number
  monthly_queries: number
  monthly_tokens: number
  monthly_cost_microusd: number | null
  max_file_bytes: number
  max_files_per_request: number
  max_pdf_pages: number
  query_rate_per_minute: number
  upload_rate_per_minute: number
}

const BASE = (
  import.meta.env.VITE_RAG_API_BASE_URL?.trim() || "/api/rag/v1"
).replace(/\/+$/, "")
let token: { value: string; expiresAt: number } | null = null

const accessToken = async (force = false) => {
  if (!force && token && token.expiresAt > Date.now()) return token.value
  const response = await apiClient.post<AdminToken>("/admin/rag/access-token")
  token = {
    value: response.access_token,
    expiresAt: Date.now() + Math.max(10, response.expires_in - 30) * 1000,
  }
  return token.value
}

const request = async <T>(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> => {
  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")
  headers.set("Authorization", `Bearer ${await accessToken()}`)
  const response = await fetch(`${BASE}/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
  })
  if (response.status === 401 && retry) {
    token = null
    await accessToken(true)
    return request<T>(path, init, false)
  }
  if (!response.ok) {
    let problem: ApiProblem | undefined
    try {
      problem = (await response.clone().json()) as ApiProblem
    } catch {
      problem = undefined
    }
    throw new HttpError(response, problem)
  }
  if (response.status === 204) return null as T
  return (await response.json()) as T
}

const json = (value: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(value),
})

export const ragAdminApi = {
  listModels: () => request<AdminModel[]>("/admin/models"),
  saveModel: (model: AdminModel) =>
    request<AdminModel>(`/admin/models/${encodeURIComponent(model.id)}`, {
      method: "PUT",
      ...json(model),
    }),
  deleteModel: (modelId: string) =>
    request<void>(`/admin/models/${encodeURIComponent(modelId)}`, {
      method: "DELETE",
    }),
  listTenants: () => request<AdminTenant[]>("/admin/tenants"),
  updateTenant: (businessId: string, limits: Partial<AdminTenant>) =>
    request<AdminTenant>(`/admin/tenants/${businessId}/limits`, {
      method: "PATCH",
      ...json(limits),
    }),
}

export const clearRagAdminToken = () => {
  token = null
}
