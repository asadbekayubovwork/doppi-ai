import { createHead } from "@unhead/vue/client"
import { createPinia, setActivePinia } from "pinia"
import { flushPromises, mount } from "@vue/test-utils"
import { createRouter, createWebHistory } from "vue-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { authApi, CAuthVerifyStep } from "@/features/auth"
import { HttpError } from "@/shared/api"
import PLogin from "../PLogin.vue"
import PRegister from "../PRegister.vue"
import PForgotPassword from "../PForgotPassword.vue"

const mountPage = (component: object, path = "/login") => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/login", component: PLogin },
      { path: "/register", component: PRegister },
      { path: "/forgot-password", component: PForgotPassword },
      { path: "/app", component: { template: "<div />" } },
      { path: "/auth/telegram", component: { template: "<div />" } },
      { path: "/:pathMatch(.*)*", component: { template: "<div />" } },
    ],
  })
  router.push(path)
  return mount(component as never, {
    global: { plugins: [createPinia(), router, createHead()] },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.restoreAllMocks()
  vi.spyOn(authApi, "listBusinesses").mockResolvedValue([])
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("auth page flows", () => {
  it("sends remember_me and transitions to a real MFA challenge", async () => {
    vi.spyOn(authApi, "signIn").mockResolvedValue({
      status: "mfa_required",
      challenge_id: "mfa-1",
    })
    const wrapper = mountPage(PLogin)
    await wrapper.find("#login-email").setValue("user@example.com")
    await wrapper.find("#login-password").setValue("secret-password")
    await wrapper.find("form").trigger("submit")
    await vi.waitFor(() => expect(authApi.signIn).toHaveBeenCalled())
    await flushPromises()

    expect(authApi.signIn).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret-password",
      remember_me: true,
    })
    expect(wrapper.text()).toContain("MFA kodini kiriting")
    expect(wrapper.text()).not.toContain("Kod kelmadimi?")
    wrapper.unmount()
  })

  it("submits a full MFA recovery code with the remember preference", async () => {
    vi.spyOn(authApi, "signIn").mockResolvedValue({
      status: "mfa_required",
      challenge_id: "mfa-1",
    })
    vi.spyOn(authApi, "verifyMfa").mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
        email_verified_at: "2026-09-13T00:00:00Z",
        status: "active",
        first_name: "Ada",
        last_name: "Lovelace",
        locale: "uz",
        timezone: "Asia/Tashkent",
      },
      session_id: "session-1",
      expires_at: "2026-10-13T00:00:00Z",
    })
    const wrapper = mountPage(PLogin)
    await wrapper.find("#login-email").setValue("user@example.com")
    await wrapper.find("#login-password").setValue("secret-password")
    await wrapper.find("form").trigger("submit")
    await vi.waitFor(() => expect(wrapper.text()).toContain("MFA kodini kiriting"))

    const recoveryButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Tiklash kodidan"))
    expect(recoveryButton).toBeDefined()
    await recoveryButton!.trigger("click")
    await wrapper.get("#mfa-recovery").setValue("AbC-recovery-code-123456")
    await wrapper.find("form").trigger("submit")

    await vi.waitFor(() =>
      expect(authApi.verifyMfa).toHaveBeenCalledWith({
        challenge_id: "mfa-1",
        code: "AbC-recovery-code-123456",
        remember_me: true,
      })
    )
    wrapper.unmount()
  })

  it("disables password login for the server Retry-After window", async () => {
    vi.useFakeTimers()
    vi.spyOn(authApi, "signIn").mockRejectedValue(
      new HttpError(
        new Response(null, { status: 429, statusText: "Too Many Requests" }),
        { code: "RATE_LIMITED", detail: "Wait before retrying." },
        2
      )
    )
    const wrapper = mountPage(PLogin)
    await wrapper.find("#login-email").setValue("user@example.com")
    await wrapper.find("#login-password").setValue("secret-password")
    await wrapper.find("form").trigger("submit")
    await flushPromises()

    const submit = wrapper.find('button[type="submit"]')
    expect(submit.attributes("disabled")).toBeDefined()
    expect(submit.text()).toContain("2 soniyadan")
    await vi.advanceTimersByTimeAsync(2000)
    expect(submit.attributes("disabled")).toBeUndefined()
    wrapper.unmount()
    vi.useRealTimers()
  })

  it("retains the signup challenge and verifies it through the backend", async () => {
    vi.spyOn(authApi, "signup").mockResolvedValue({
      status: "verification_required",
      user_id: "user-1",
      business_id: "business-1",
      challenge_id: "challenge-1",
    })
    vi.spyOn(authApi, "verifyEmail").mockResolvedValue({ status: "verified" })
    const wrapper = mountPage(PRegister, "/register")
    await wrapper.find("#register-first-name").setValue("Ada")
    await wrapper.find("#register-last-name").setValue("Lovelace")
    await wrapper.find("#register-email").setValue("user@example.com")
    await wrapper.find("#register-business").setValue("Analytical Engines")
    await wrapper.find("#register-password").setValue("secret-password")
    await wrapper.find("form").trigger("submit")
    await vi.waitFor(() => expect(authApi.signup).toHaveBeenCalled())
    await flushPromises()
    expect(wrapper.text()).toContain("Emailni tasdiqlang")
    expect(authApi.signup).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret-password",
      first_name: "Ada",
      last_name: "Lovelace",
      business_name: "Analytical Engines",
    })

    const verify = wrapper.findComponent(CAuthVerifyStep)
    verify.vm.$emit("update:modelValue", "123456")
    verify.vm.$emit("submit")
    await vi.waitFor(() => expect(authApi.verifyEmail).toHaveBeenCalledWith({ challenge_id: "challenge-1", code: "123456" }))
    wrapper.unmount()
  })

  it("keeps the reset token in the flow and sends it only to confirmation", async () => {
    vi.spyOn(authApi, "requestPasswordReset").mockResolvedValue({ status: "accepted", challenge_id: "reset-1" })
    vi.spyOn(authApi, "verifyPasswordReset").mockResolvedValue({ status: "verified", reset_token: "reset-token-value" })
    vi.spyOn(authApi, "confirmPasswordReset").mockResolvedValue({ status: "password_updated" })
    const wrapper = mountPage(PForgotPassword, "/forgot-password")
    await wrapper.find("#reset-email").setValue("user@example.com")
    await wrapper.find("form").trigger("submit")
    await vi.waitFor(() => expect(authApi.requestPasswordReset).toHaveBeenCalled())
    const verify = wrapper.findComponent(CAuthVerifyStep)
    verify.vm.$emit("update:modelValue", "123456")
    verify.vm.$emit("submit")
    await vi.waitFor(() => expect(authApi.verifyPasswordReset).toHaveBeenCalledWith({ challenge_id: "reset-1", code: "123456" }))
    await flushPromises()
    await wrapper.find("#reset-password").setValue("new-secret-password")
    await wrapper.find("#reset-confirmation").setValue("new-secret-password")
    await wrapper.find("form").trigger("submit")
    await vi.waitFor(() => expect(authApi.confirmPasswordReset).toHaveBeenCalledWith({ reset_token: "reset-token-value", new_password: "new-secret-password" }))
    wrapper.unmount()
  })
})
