import { createHead } from "@vueuse/head"
import { createPinia, setActivePinia } from "pinia"
import { flushPromises, mount } from "@vue/test-utils"
import { createRouter, createWebHistory } from "vue-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { authApi, CAuthVerifyStep } from "@/features/auth"
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

afterEach(() => vi.restoreAllMocks())

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
    await wrapper.find("input[type=checkbox]").setValue(true)
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
