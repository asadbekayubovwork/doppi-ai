import { apiUrl, isCrossOriginApi } from "@/shared/config/api"
import { HttpError, type ApiClientConfig, type ApiProblem } from "./types"

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

const csrfToken = () => {
  if (typeof document === "undefined") return null
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("__Host-doppi_csrf="))
    ?.split("=")
    .slice(1)
    .join("=")
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const parseRetryAfter = (value: string | null) => {
  if (!value) return undefined
  const seconds = Number.parseInt(value, 10)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined
}

const parseJson = async <T>(response: Response): Promise<T | undefined> => {
  const contentType = response.headers.get("Content-Type") || ""
  if (!contentType.includes("json")) return undefined
  try {
    return (await response.clone().json()) as T
  } catch {
    return undefined
  }
}

/**
 * The core, private fetcher function.
 * It's not meant to be used directly by features.
 */
export async function http<T>(
  url: string,
  config: ApiClientConfig = {}
): Promise<T> {
  const { data, params, headers: configuredHeaders, ...requestInit } = config
  const method = (requestInit.method || "GET").toUpperCase()
  const headers = new Headers({
    Accept: "application/json",
    ...(data === undefined ? {} : { "Content-Type": "application/json" }),
    ...configuredHeaders,
  })

  if (UNSAFE_METHODS.has(method) && !headers.has("X-CSRF-Token")) {
    const token = csrfToken()
    if (token) headers.set("X-CSRF-Token", token)
  }

  let fullUrl = apiUrl(url)
  if (params) {
    const queryParams = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    )
    fullUrl += `?${queryParams.toString()}`
  }

  const response = await fetch(fullUrl, {
    ...requestInit,
    method,
    headers,
    // A cross-origin base URL still has to carry the HttpOnly session cookie.
    credentials:
      requestInit.credentials || (isCrossOriginApi ? "include" : "same-origin"),
    body: data === undefined ? undefined : JSON.stringify(data),
  })

  if (!response.ok) {
    const problem = await parseJson<ApiProblem>(response)
    throw new HttpError(
      response,
      problem,
      parseRetryAfter(response.headers.get("Retry-After"))
    )
  }

  if (response.status === 204 || response.status === 205) return null as T
  const result = await parseJson<T>(response)
  return (result === undefined ? null : result) as T
}
