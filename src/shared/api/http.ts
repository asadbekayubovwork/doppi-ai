import { HttpError, type ApiClientConfig } from "./types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"

/**
 * The core, private fetcher function.
 * It's not meant to be used directly by features.
 */
export async function http<T>(
  url: string,
  config: ApiClientConfig = {}
): Promise<T> {
  // 1. Get base URL and auth token
  const token = localStorage.getItem("authToken")

  // 2. Create headers
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    // Spread any headers from the config
    ...config.headers,
  })

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // 3. Handle query parameters
  let fullUrl = `${API_BASE_URL}${url}`
  if (config.params) {
    const queryParams = new URLSearchParams(
      Object.entries(config.params).map(([key, value]) => [key, String(value)])
    )
    fullUrl += `?${queryParams.toString()}`
  }

  // 4. Make the request using native fetch
  const response = await fetch(fullUrl, {
    ...config,
    headers,
    // Use `data` property for the body, like Axios
    body: config.data ? JSON.stringify(config.data) : null,
  })

  // 5. Handle the response
  if (!response.ok) {
    // If the response is not OK, throw our custom error
    // TanStack Query will catch this and put it in the `error` state
    throw new HttpError(response)
  }

  // If the response is OK but has no content (e.g., DELETE request)
  if (response.status === 204 || response.status === 205) {
    return null as T
  }

  // Otherwise, parse the JSON and return it
  return response.json()
}
