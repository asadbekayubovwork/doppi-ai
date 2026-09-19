/**
 * Single source of truth for the Do'ppi control-plane API.
 *
 * The contract is the OpenAPI document published at `${API_ORIGIN}/api/docs`
 * (raw spec: `/api/openapi.json`). Every documented path is already versioned
 * under `/api/v1`, so `API_BASE_URL` carries that prefix and callers pass the
 * bare path — `apiClient.post("/auth/login")` hits `/api/v1/auth/login`.
 *
 * The default is deliberately relative. Sessions are HttpOnly `__Host-`
 * cookies and the backend allowlists exactly one browser origin — the one
 * below — so a cross-origin call from anywhere else is rejected before it
 * reaches the app (`400 Disallowed CORS origin`). Production serves the SPA
 * and the API from that same origin, and `vite.config.ts` proxies `/api` to it
 * in development, so the browser stays on a single origin either way.
 *
 * Point a build at another deployment with `VITE_API_BASE_URL`. An absolute
 * value there switches fetch to `credentials: "include"` automatically, and
 * that origin has to be allowlisted by the backend for the cookie to survive.
 */
export const API_ORIGIN = "https://doppiai.uz"

/** Version segment of the published contract; part of every documented path. */
export const API_VERSION = "v1"

/** Swagger UI for the contract this client is written against. */
export const API_DOCS_URL = `${API_ORIGIN}/api/docs`

const configured = import.meta.env.VITE_API_BASE_URL?.trim()

/** Prefix every request is resolved against, without a trailing slash. */
export const API_BASE_URL = (configured || `/api/${API_VERSION}`).replace(
  /\/+$/,
  ""
)

/**
 * True when requests leave the page's own origin, which is the only case that
 * needs `credentials: "include"` to carry the session cookie.
 */
export const isCrossOriginApi = (() => {
  if (!/^https?:\/\//i.test(API_BASE_URL)) return false
  if (typeof window === "undefined") return true
  try {
    return new URL(API_BASE_URL).origin !== window.location.origin
  } catch {
    return false
  }
})()

/** Resolves a documented path against the base URL. */
export const apiUrl = (path: string) =>
  `${API_BASE_URL}/${path.replace(/^\//, "")}`

/**
 * Adds the initiating browser origin to an OAuth navigation. The backend only
 * accepts configured origins and stores the exact callback URI with the state.
 */
export const oauthAuthorizeUrl = (path: string, endpoint?: string) => {
  const base = endpoint?.trim() || apiUrl(path)
  if (typeof window === "undefined") return base
  const url = new URL(base, window.location.origin)
  url.searchParams.set("client_origin", window.location.origin)
  return url.origin === window.location.origin
    ? `${url.pathname}${url.search}${url.hash}`
    : url.href
}
