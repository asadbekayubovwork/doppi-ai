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

describe("auth session store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it("bootstraps a cookie session and loads businesses without persisting a token", async () => {
    vi.spyOn(authApi, "getSession").mockResolvedValue({
      user,
      session_id: "session-1",
      expires_at: "2026-09-14T00:00:00Z",
    })
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
