import { createPinia, setActivePinia } from "pinia"
import { authApi } from "../../api/authApi"
import { useAuthStore } from "../auth.store"

const user = {
  id: "user-1",
  email: "user@example.com",
  email_verified_at: "2026-09-13T00:00:00Z",
  status: "active",
  first_name: "Ada",
  last_name: "Lovelace",
  locale: "uz",
  timezone: "Asia/Tashkent",
}

const session = {
  user,
  session_id: "session-1",
  expires_at: "2026-09-14T00:00:00Z",
}

const deferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe("auth session store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it("bootstraps a cookie session and loads businesses without persisting a token", async () => {
    vi.spyOn(authApi, "getSession").mockResolvedValue(session)
    vi.spyOn(authApi, "listBusinesses").mockResolvedValue([])
    const store = useAuthStore()

    await store.bootstrap()

    expect(store.status).toBe("authenticated")
    expect(store.user?.email).toBe("user@example.com")
    expect(store.businesses).toEqual([])
    const legacyTokenKey = ["auth", "Token"].join("")
    expect(localStorage.getItem(legacyTokenKey)).toBeNull()
    expect(sessionStorage.getItem(legacyTokenKey)).toBeNull()
  })

  it("shares one in-flight bootstrap request with concurrent callers", async () => {
    const request = deferred<typeof session>()
    const getSession = vi
      .spyOn(authApi, "getSession")
      .mockReturnValue(request.promise)
    vi.spyOn(authApi, "listBusinesses").mockResolvedValue([])
    const store = useAuthStore()

    const first = store.bootstrap()
    const second = store.bootstrap()

    expect(getSession).toHaveBeenCalledOnce()
    request.resolve(session)

    await expect(Promise.all([first, second])).resolves.toEqual([true, true])
    expect(store.status).toBe("authenticated")
  })

  it("does not let an older response overwrite a forced bootstrap", async () => {
    const first = deferred<typeof session>()
    const second = deferred<typeof session>()
    const oldSession = { ...session, session_id: "old-session" }
    const freshSession = { ...session, session_id: "fresh-session" }
    vi.spyOn(authApi, "getSession")
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    vi.spyOn(authApi, "listBusinesses").mockResolvedValue([])
    const store = useAuthStore()

    const oldRequest = store.bootstrap()
    const freshRequest = store.bootstrap(true)
    second.resolve(freshSession)
    await freshRequest
    first.resolve(oldSession)
    await oldRequest

    expect(store.session?.session_id).toBe("fresh-session")
  })

  it("keeps the session authenticated and exposes a retryable business error", async () => {
    const businessError = new Error("business service unavailable")
    vi.spyOn(authApi, "getSession").mockResolvedValue(session)
    vi.spyOn(authApi, "listBusinesses").mockRejectedValue(businessError)
    const store = useAuthStore()

    await expect(store.bootstrap()).resolves.toBe(true)

    expect(store.status).toBe("authenticated")
    expect(store.user?.id).toBe(user.id)
    expect(store.businessError).toBe(businessError)
  })

  it("does not turn a post-login business failure into an auth failure", async () => {
    vi.spyOn(authApi, "signIn").mockResolvedValue(session)
    const businessError = new Error("business service unavailable")
    vi.spyOn(authApi, "listBusinesses").mockRejectedValue(businessError)
    const store = useAuthStore()

    await expect(
      store.login({ email: user.email, password: "secret-password", remember_me: true })
    ).resolves.toEqual(session)

    expect(store.status).toBe("authenticated")
    expect(store.businessError).toBe(businessError)
  })

  it("passes remember-me and preserves MFA authentication when business loading fails", async () => {
    vi.spyOn(authApi, "verifyMfa").mockResolvedValue(session)
    vi.spyOn(authApi, "listBusinesses").mockRejectedValue(new Error("offline"))
    const verifyMfa = vi.mocked(authApi.verifyMfa)
    const store = useAuthStore()
    store.mfaChallengeId = "mfa-1"
    store.mfaRememberMe = true

    await expect(store.verifyMfa("AbC-recovery-code-123456")).resolves.toEqual(session)

    expect(verifyMfa).toHaveBeenCalledWith({
      challenge_id: "mfa-1",
      code: "AbC-recovery-code-123456",
      remember_me: true,
    })
    expect(store.status).toBe("authenticated")
    expect(store.businessError).toBeInstanceOf(Error)
  })

  it("establishes Telegram sessions through the store action", async () => {
    vi.spyOn(authApi, "telegramLogin").mockResolvedValue(session)
    vi.spyOn(authApi, "listBusinesses").mockRejectedValue(new Error("offline"))
    const store = useAuthStore()

    await expect(store.telegramLogin({ id: "42", hash: "signed" })).resolves.toEqual(session)

    expect(store.status).toBe("authenticated")
    expect(store.businessError).toBeInstanceOf(Error)
  })

  it("clears the authenticated state on logout even when the request fails", async () => {
    const logout = vi.spyOn(authApi, "logout").mockRejectedValue(new Error("offline"))
    const store = useAuthStore()
    store.user = user
    store.status = "authenticated"

    await expect(store.logout()).rejects.toThrow("offline")

    expect(logout).toHaveBeenCalledOnce()
    expect(store.status).toBe("anonymous")
    expect(store.user).toBeNull()
  })

  it("returns to anonymous state when login fails", async () => {
    vi.spyOn(authApi, "signIn").mockRejectedValue(new Error("invalid credentials"))
    const store = useAuthStore()

    await expect(
      store.login({ email: "user@example.com", password: "wrong-password" })
    ).rejects.toThrow("invalid credentials")
    expect(store.status).toBe("anonymous")
  })

  it("only accepts local return paths", async () => {
    const store = useAuthStore()

    expect(store.safeRedirect("/app/rag")).toBe("/app/rag")
    expect(store.safeRedirect("https://evil.example")).toBe("/app")
    expect(store.safeRedirect("//evil.example")).toBe("/app")
    expect(store.safeRedirect("/login")).toBe("/app")
  })
})
