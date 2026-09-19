import {
  API_BASE_URL,
  API_DOCS_URL,
  API_ORIGIN,
  apiUrl,
  oauthAuthorizeUrl,
} from "../api"

const loadWithBaseUrl = async (value: string) => {
  vi.resetModules()
  vi.stubEnv("VITE_API_BASE_URL", value)
  return import("../api")
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe("API configuration", () => {
  it("defaults to the versioned same-origin prefix of the published contract", () => {
    expect(API_ORIGIN).toBe("https://doppiai.uz")
    expect(API_DOCS_URL).toBe("https://doppiai.uz/api/docs")
    expect(API_BASE_URL).toBe("/api/v1")
  })

  it("joins documented paths onto the base URL exactly once", () => {
    expect(apiUrl("/auth/login")).toBe("/api/v1/auth/login")
    expect(apiUrl("auth/login")).toBe("/api/v1/auth/login")
  })

  it("binds OAuth navigation to the initiating browser origin", () => {
    expect(oauthAuthorizeUrl("/auth/oauth/google/authorize")).toBe(
      `/api/v1/auth/oauth/google/authorize?client_origin=${encodeURIComponent(window.location.origin)}`
    )
  })

  it("binds an endpoint override without losing its query parameters", () => {
    const result = oauthAuthorizeUrl(
      "/auth/oauth/google/authorize",
      "/api/v1/auth/oauth/google/authorize?source=login&client_origin=https%3A%2F%2Fold.example"
    )
    const url = new URL(result, window.location.origin)

    expect(url.pathname).toBe("/api/v1/auth/oauth/google/authorize")
    expect(url.searchParams.get("source")).toBe("login")
    expect(url.searchParams.getAll("client_origin")).toEqual([
      window.location.origin,
    ])
  })

  it("honours an override and strips its trailing slashes", async () => {
    const config = await loadWithBaseUrl("https://doppiai.uz/api/v1/")

    expect(config.API_BASE_URL).toBe("https://doppiai.uz/api/v1")
    expect(config.apiUrl("/me")).toBe("https://doppiai.uz/api/v1/me")
  })

  it("sends credentials cross-origin only when the base URL leaves this origin", async () => {
    const relative = await loadWithBaseUrl("")
    expect(relative.isCrossOriginApi).toBe(false)

    const sameOrigin = await loadWithBaseUrl(`${window.location.origin}/api/v1`)
    expect(sameOrigin.isCrossOriginApi).toBe(false)

    const crossOrigin = await loadWithBaseUrl("https://doppiai.uz/api/v1")
    expect(crossOrigin.isCrossOriginApi).toBe(true)
  })
})
