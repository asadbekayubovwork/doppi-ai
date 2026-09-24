import { describe, it, expect, afterEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createI18n } from "vue-i18n"
import { createHead } from "@unhead/vue/client"
import { createRouter, createWebHistory } from "vue-router"
import { messages } from "@/shared/config/i18n"

// Note: TypeScript errors in test files are expected and can be ignored
import PIndex from "../PIndex.vue"

/**
 * Whole-page smoke test: every landing section is mounted together with i18n,
 * router and head, so a broken widget (bad i18n path, timer wired to a missing
 * ref, template typo) fails here instead of in the browser.
 */
const buildApp = (locale = "uz") => {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: "en",
    messages,
    globalInjection: true,
  })

  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
  })

  return mount(PIndex as never, {
    global: { plugins: [i18n, router, createHead()] },
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe("PIndex (landing page)", () => {
  it("mounts every section without errors", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const wrapper = buildApp()

    // The section anchors the navigation and footer link to must all exist.
    for (const id of ["top", "solution", "features", "how", "results", "faq", "about"]) {
      expect(wrapper.find(`#${id}`).exists(), `#${id} is missing`).toBe(true)
    }

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
    wrapper.unmount()
  })

  it("renders the home value proposition and core modules", () => {
    const wrapper = buildApp()
    const text = wrapper.text()

    expect(text).toContain("biznesingiz uchun AI marketing operatsion tizimi")
    expect(text).toContain("barchasi bir tizimda")
    expect(text).toContain("SIP Telefoniya")
    expect(text).toContain("AI Ovozli Agent")
    // The lead form lives on /contact-us only.
    expect(wrapper.find("#contact").exists()).toBe(false)

    wrapper.unmount()
  })

  it("has no Toolbar AI branding left on the page", () => {
    const wrapper = buildApp("en")

    expect(wrapper.text()).not.toContain("Toolbar")
    expect(wrapper.text()).toContain("Do'ppi AI")

    wrapper.unmount()
  })
})
