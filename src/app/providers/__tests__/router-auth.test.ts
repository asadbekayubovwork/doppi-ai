import { routes } from "@/pages"
import { authApi, useAuthStore } from "@/features/auth"
import { pinia } from "../pinia"
import { router, safeLocalPath } from "../router"

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

beforeEach(async () => {
  useAuthStore(pinia).$reset()
  vi.restoreAllMocks()
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  })
  await router.replace("/")
})

describe("auth route boundary", () => {
  it("marks every app route as protected and exposes the OAuth callback", () => {
    const appRoutes = routes.filter((route) => route.path.startsWith("/app"))
    expect(appRoutes.length).toBeGreaterThan(0)
    expect(appRoutes.every((route) => route.meta?.requiresAuth === true)).toBe(true)
    expect(routes.some((route) => route.path === "/auth/callback")).toBe(true)
  })

  it("keeps only safe local redirect destinations", () => {
    expect(safeLocalPath("/app/settings")).toBe("/app/settings")
    expect(safeLocalPath("https://evil.example/path")).toBe("/app")
    expect(safeLocalPath("//evil.example/path")).toBe("/app")
    expect(safeLocalPath("/login")).toBe("/app")
    expect(safeLocalPath("/appfoo")).toBe("/app")
    expect(safeLocalPath("/app%2F..%2Flogin")).toBe("/app")
  })

  it("redirects an unauthenticated deep link and bootstraps an authenticated one", async () => {
    vi.spyOn(authApi, "getSession").mockRejectedValue(new Error("anonymous"))
    await router.push("/app/settings")

    expect(router.currentRoute.value.name).toBe("Login")
    expect(router.currentRoute.value.query.redirect).toBe("/app/settings")

    vi.spyOn(authApi, "getSession").mockResolvedValue({
      user,
      session_id: "session-1",
      expires_at: "2026-09-14T00:00:00Z",
    })
    vi.spyOn(authApi, "listBusinesses").mockResolvedValue([])
    useAuthStore(pinia).status = "unknown"
    await router.push("/app/rag")

    expect(router.currentRoute.value.name).toBe("RagAgent")
    expect(useAuthStore(pinia).isAuthenticated).toBe(true)
  })
})
