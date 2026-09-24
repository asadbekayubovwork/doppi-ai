import { flushPromises, mount } from "@vue/test-utils"
import { createHead } from "@unhead/vue/client"
import { createMemoryHistory, createRouter } from "vue-router"
import { createPinia } from "pinia"
import AdminLayout from "@/app/layouts/ui/AdminLayout.vue"
import PPlatformAdmin from "@/pages/PPlatformAdmin.vue"
import {
  platformAdminApi,
  type AdminAnalytics,
} from "../../api/platformAdminApi"

const day = {
  date: "2026-09-24",
  new_users: 1,
  usage_events: 2,
  credits_spent: 12,
  video_jobs: 1,
}
const analytics: AdminAnalytics = {
  period_days: 30,
  generated_at: "2026-09-24T08:00:00+00:00",
  users: { total: 11, new: 1, active: 6, verified: 9, suspended: 1 },
  businesses: { total: 12, pro: 3 },
  billing: {
    available: 2_500,
    held: 100,
    spent_all_time: 4_000,
    spent_period: 12,
    expiring_7d: 250,
    welcome_claims: 1,
  },
  services: [{ service: "rag", events: 2, credits: 12 }],
  video: {
    total: 1,
    statuses: { failed: 1 },
    recent_failures: [
      {
        id: "job-1",
        status: "failed",
        business_name: "Test Biznes",
        updated_at: "2026-09-24T08:00:00+00:00",
      },
    ],
  },
  top_businesses: [
    { id: "business-1", name: "Test Biznes", events: 2, credits: 12 },
  ],
  daily: [day],
}

describe("super admin dashboards", () => {
  afterEach(() => vi.restoreAllMocks())

  it("loads real analytics, switches service dashboard and changes the period", async () => {
    const analyticsRequest = vi
      .spyOn(platformAdminApi, "analytics")
      .mockResolvedValue(analytics)
    vi.spyOn(platformAdminApi, "activity").mockResolvedValue([])
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/admin", component: PPlatformAdmin },
        { path: "/app", component: { template: "<div />" } },
      ],
    })
    await router.push("/admin")
    const wrapper = mount(AdminLayout, {
      slots: { default: PPlatformAdmin },
      global: { plugins: [router, createPinia(), createHead()] },
    })
    await flushPromises()
    expect(analyticsRequest).toHaveBeenCalledWith(30)
    expect(wrapper.text()).toContain("Bir qarashda butun Do‘ppi AI")
    expect(wrapper.text().replaceAll("\u00a0", " ")).toContain("2 500")
    expect(
      wrapper.find("aside[aria-label='Super Admin navigatsiyasi']").exists()
    ).toBe(true)
    expect(wrapper.find("aside a[href='/app']").text()).toContain(
      "Ish joyiga qaytish"
    )

    await wrapper
      .findAll("nav a")
      .find((link) => link.text().includes("Xizmatlar"))!
      .trigger("click")
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe("/admin?tab=services")
    expect(wrapper.find("nav a[aria-current='page']").text()).toContain(
      "Xizmatlar"
    )
    expect(wrapper.text()).toContain("Ishlatish va kredit sarfi")
    expect(wrapper.text()).toContain("Test Biznes")
    expect(wrapper.text()).toContain("RAG suhbat")

    await wrapper
      .findAll("header button")
      .find((button) => button.text().includes("7 kun"))!
      .trigger("click")
    await flushPromises()
    expect(analyticsRequest).toHaveBeenLastCalledWith(7)
    wrapper.unmount()
  })
})
