import { apiClient, HttpError, type ApiProblem } from "@/shared/api"

interface AccessTokenResponse {
  access_token: string
  expires_in: number
}

interface CachedToken {
  value: string
  expiresAt: number
}

const tokenCache = new Map<string, CachedToken>()
const tokenRequests = new Map<string, Promise<string>>()
const RAG_BASE_URL = (
  import.meta.env.VITE_RAG_API_BASE_URL?.trim() || "/api/rag/v1"
).replace(/\/+$/, "")

const requestToken = async (businessId: string) => {
  const response = await apiClient.post<AccessTokenResponse>(
    `/businesses/${businessId}/rag/access-token`
  )
  tokenCache.set(businessId, {
    value: response.access_token,
    expiresAt: Date.now() + Math.max(10, response.expires_in - 30) * 1000,
  })
  return response.access_token
}

const accessToken = async (businessId: string, force = false) => {
  const cached = tokenCache.get(businessId)
  if (!force && cached && cached.expiresAt > Date.now()) return cached.value
  const pending = tokenRequests.get(businessId)
  if (!force && pending) return pending
  const request = requestToken(businessId).finally(() => {
    if (tokenRequests.get(businessId) === request)
      tokenRequests.delete(businessId)
  })
  tokenRequests.set(businessId, request)
  return request
}

const responseError = async (response: Response) => {
  let problem: ApiProblem | undefined
  try {
    problem = (await response.clone().json()) as ApiProblem
  } catch {
    problem = undefined
  }
  return new HttpError(response, problem)
}

export async function ragHttp<T>(
  businessId: string,
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")
  headers.set("Authorization", `Bearer ${await accessToken(businessId)}`)
  const response = await fetch(`${RAG_BASE_URL}/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
  })
  if (response.status === 401 && retry) {
    tokenCache.delete(businessId)
    await accessToken(businessId, true)
    return ragHttp<T>(businessId, path, init, false)
  }
  if (!response.ok) throw await responseError(response)
  if (response.status === 204) return null as T
  return (await response.json()) as T
}

export const jsonBody = (
  data: unknown
): Pick<RequestInit, "body" | "headers"> => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
})

export const clearRagTokens = () => {
  tokenCache.clear()
  tokenRequests.clear()
}
