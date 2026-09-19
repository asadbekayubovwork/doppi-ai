import { createHead } from "@unhead/vue/client"
import { createPinia, setActivePinia } from "pinia"
import { flushPromises, mount } from "@vue/test-utils"
import { createRouter, createWebHistory } from "vue-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { authApi } from "@/features/auth"
import { HttpError } from "@/shared/api"
import { routes } from "@/pages"
import PAuthCallback from "../PAuthCallback.vue"

const user = {
  id: "user-1",
  email: "aziz@example.com",
  email_verified_at: "2026-09-13T00:00:00Z",
  status: "active",
  first_name: "Aziz",
  last_name: "Karimov",
  locale: "uz",
  timezone: "Asia/Tashkent",
}

const mountCallback = async (path: string) => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/auth/callback", component: PAuthCallback },
      { path: "/:pathMatch(.*)*", component: { template: "<div />" } },
    ],
  })
  await router.push(path)
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(PAuthCallback, {
    global: { plugins: [pinia, router, createHead()] },
  })
  return { wrapper, router }
}

beforeEach(() => {
  vi.restoreAllMocks()
  sessionStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  sessionStorage.clear()
})

describe("OAuth callback page", () => {
  it("walks the steps and lands on the stored return path", async () => {
    sessionStorage.setItem("doppi_auth_return_path", "/app/settings")
    let resolveSession!: (value: Awaited<ReturnType<typeof authApi.getSession>>) => void
    vi.spyOn(authApi, "getSession").mockReturnValue(
      new Promise((resolve) => (resolveSession = resolve))
    )
    vi.spyOn(authApi, "listBusinesses").mockResolvedValue([])

    const { wrapper, router } = await mountCallback("/auth/callback?status=success")
    await flushPromises()

    expect(wrapper.text()).toContain("Tizimga kirilmoqda...")
    expect(wrapper.text()).toContain("2/3-qadam")
    expect(wrapper.text()).toContain("/app/settings sahifasiga")
    const [google, session, workspace] = wrapper.findAll("li").map((li) => li.text())
    expect(google).toContain("Tayyor")
    expect(session).toContain("Jarayonda")
    expect(workspace).toContain("Kutilmoqda")

    resolveSession({
      user,
      session_id: "session-1",
      expires_at: "2026-10-13T00:00:00Z",
    })
    await vi.waitFor(() =>
      expect(router.currentRoute.value.fullPath).toBe("/app/settings")
    )
    expect(sessionStorage.getItem("doppi_auth_return_path")).toBeNull()
    wrapper.unmount()
  })

  it("explains a cancelled Google consent without touching the session", async () => {
    const getSession = vi.spyOn(authApi, "getSession")
    const { wrapper } = await mountCallback(
      "/auth/callback?status=error&error=access_denied&trace_id=8f2c-41ad"
    )
    await flushPromises()

    const text = wrapper.text()
    expect(getSession).not.toHaveBeenCalled()
    expect(text).toContain("Tizimga kira olmadik")
    expect(text).toContain("Google so'rovni sessiya yaratilishidan oldin bekor qildi")
    expect(text).toContain("Xato kodi: access_denied · so'rov ID 8f2c-41ad")
    const [google, session, workspace] = wrapper.findAll("li").map((li) => li.text())
    expect(google).toContain("Xatolik")
    expect(session).toContain("Bajarilmadi")
    expect(workspace).toContain("Bajarilmadi")
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
    expect(
      wrapper.findAll("button").some((button) => button.text().includes("Google orqali qayta urinish"))
    ).toBe(true)
    wrapper.unmount()
  })

  it("marks session creation as failed when the session cannot be read", async () => {
    vi.spyOn(authApi, "getSession").mockRejectedValue(
      new HttpError(new Response(null, { status: 401, statusText: "Unauthorized" }), {
        code: "AUTHENTICATION_REQUIRED",
        trace_id: "trace-9",
      })
    )
    const { wrapper, router } = await mountCallback("/auth/callback?status=success")
    await vi.waitFor(() => expect(wrapper.text()).toContain("Tizimga kira olmadik"))

    const [google, session] = wrapper.findAll("li").map((li) => li.text())
    expect(google).toContain("Tayyor")
    expect(session).toContain("Xatolik")
    expect(wrapper.text()).toContain("Xato kodi: AUTHENTICATION_REQUIRED · so'rov ID trace-9")
    expect(router.currentRoute.value.path).toBe("/auth/callback")
    wrapper.unmount()
  })
})

describe("auth routes", () => {
  it("share AuthLayout so only the right-hand column changes between them", () => {
    const authPaths = ["/login", "/register", "/forgot-password", "/auth/callback", "/auth/telegram"]
    for (const path of authPaths) {
      expect(routes.find((route) => route.path === path)?.meta?.layout).toBe("AuthLayout")
    }
  })
})
