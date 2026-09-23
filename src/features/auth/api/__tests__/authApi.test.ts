import { apiClient } from "@/shared/api"
import { authApi } from "../authApi"

describe("backend auth API contracts", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("keeps the local callback origin when an OAuth URL override is configured", () => {
    vi.stubEnv("VITE_GOOGLE_OAUTH_URL", "/api/v1/auth/oauth/google/authorize")

    const url = new URL(authApi.googleAuthorizeUrl(), window.location.origin)

    expect(url.origin).toBe(window.location.origin)
    expect(url.searchParams.get("client_origin")).toBe(window.location.origin)
  })

  it("sends login payload including remember_me", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({} as never)

    await authApi.signIn({
      email: "user@example.com",
      password: "secret-password",
      remember_me: true,
    })

    expect(post).toHaveBeenCalledWith("/auth/login", {
      email: "user@example.com",
      password: "secret-password",
      remember_me: true,
    })
  })

  it("uses the signup, verification, and resend contracts", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({} as never)

    await authApi.signup({
      email: "user@example.com",
      password: "secret-password",
      first_name: "Ada",
      last_name: "Lovelace",
      business_name: "Analytical Engines",
    })
    await authApi.verifyEmail({ challenge_id: "challenge-1", code: "123456" })
    await authApi.requestEmailVerification({ email: "user@example.com" })

    expect(post).toHaveBeenNthCalledWith(1, "/auth/signup", {
      email: "user@example.com",
      password: "secret-password",
      first_name: "Ada",
      last_name: "Lovelace",
      business_name: "Analytical Engines",
    })
    expect(post).toHaveBeenNthCalledWith(
      2,
      "/auth/email-verifications/verify",
      {
        challenge_id: "challenge-1",
        code: "123456",
      }
    )
    expect(post).toHaveBeenNthCalledWith(3, "/auth/email-verifications", {
      email: "user@example.com",
    })
  })

  it("covers MFA, reset, session, provider, and business endpoints", () => {
    const methodNames = [
      "verifyMfa",
      "requestPasswordReset",
      "verifyPasswordReset",
      "confirmPasswordReset",
      "getSession",
      "logout",
      "googleAuthorizeUrl",
      "telegramLogin",
      "listBusinesses",
      "createBusiness",
      "selectBusiness",
    ]

    for (const methodName of methodNames) {
      expect(typeof (authApi as Record<string, unknown>)[methodName]).toBe(
        "function"
      )
    }
  })

  it("posts exact MFA, reset, Telegram, logout, and business payloads", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({} as never)
    const get = vi.spyOn(apiClient, "get").mockResolvedValue([] as never)

    await authApi.verifyMfa({
      challenge_id: "mfa-1",
      code: "RECOVERY-CODE-123456",
      remember_me: true,
    })
    await authApi.requestPasswordReset("user@example.com")
    await authApi.verifyPasswordReset({
      challenge_id: "reset-1",
      code: "654321",
    })
    await authApi.confirmPasswordReset({
      reset_token: "reset-token",
      new_password: "new-secret",
    })
    await authApi.logout()
    await authApi.telegramLogin({ id: 123, hash: "signed" })
    await authApi.createBusiness(
      { name: "Workspace", default_language: "uz", billing_region: "UZ" },
      "idem-1"
    )
    await authApi.selectBusiness("business-1")
    await authApi.getSession()
    await authApi.listBusinesses()

    expect(post).toHaveBeenNthCalledWith(1, "/auth/mfa/login/verify", {
      challenge_id: "mfa-1",
      code: "RECOVERY-CODE-123456",
      remember_me: true,
    })
    expect(post).toHaveBeenNthCalledWith(2, "/auth/password-resets", {
      email: "user@example.com",
    })
    expect(post).toHaveBeenNthCalledWith(3, "/auth/password-resets/verify", {
      challenge_id: "reset-1",
      code: "654321",
    })
    expect(post).toHaveBeenNthCalledWith(4, "/auth/password-resets/confirm", {
      reset_token: "reset-token",
      new_password: "new-secret",
    })
    expect(post).toHaveBeenNthCalledWith(5, "/auth/logout")
    expect(post).toHaveBeenNthCalledWith(6, "/auth/telegram/login", {
      data: { id: "123", hash: "signed" },
    })
    expect(post).toHaveBeenNthCalledWith(
      7,
      "/businesses",
      { name: "Workspace", default_language: "uz", billing_region: "UZ" },
      { headers: { "Idempotency-Key": "idem-1" } }
    )
    expect(post).toHaveBeenNthCalledWith(8, "/businesses/business-1/context")
    expect(get).toHaveBeenNthCalledWith(1, "/auth/session")
    expect(get).toHaveBeenNthCalledWith(2, "/businesses")
    expect(authApi.googleAuthorizeUrl()).toBe(
      `/api/v1/auth/oauth/google/authorize?client_origin=${encodeURIComponent(window.location.origin)}`
    )
  })
})
