import { flushPromises, mount } from "@vue/test-utils"
import { createPinia } from "pinia"
import { createHead } from "@unhead/vue/client"
import { createRouter, createMemoryHistory } from "vue-router"
import { createI18n } from "vue-i18n"
import { messages } from "@/shared/config/i18n"
import { CDashboardSidebar } from "@/widgets/dashboard-sidebar"
import PDashboardHome from "../PDashboardHome.vue"

const stub = { template: "<div />" }

// Navigation labels come from the locale files; English keeps the assertions
// readable unless a test brings its own i18n instance.
const englishI18n = () => createI18n({ legacy: false, locale: "en", messages })

const mountAt = async (
  path: string,
  component: unknown,
  i18n = englishI18n()
) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/:pathMatch(.*)*", component: stub }],
  })
  const pinia = createPinia()
  pinia.state.value.auth = {
    status: "authenticated",
    user: { first_name: "Akmal", last_name: "Karimov", email: "a@doppi.ai" },
    businesses: [
      {
        id: "business-test",
        name: "Karimov Group",
        slug: "karimov-group",
        status: "active",
        default_language: "uz",
        billing_region: "UZ",
      },
    ],
    activeBusinessId: "business-test",
  }
  await router.push(path)
  const wrapper = mount(component as never, {
    global: { plugins: [pinia, router, createHead(), i18n] },
  })
  await flushPromises()
  return wrapper
}

afterEach(() => {
  vi.useRealTimers()
})

describe("workspace home", () => {
  it("greets the user for the time of day", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date(2026, 8, 19, 14, 0))
    const wrapper = await mountAt("/app", PDashboardHome)
    expect(wrapper.find("h2").text()).toBe("Good afternoon, Akmal")
    wrapper.unmount()
  })

  it("links every service card to its page", async () => {
    const wrapper = await mountAt("/app", PDashboardHome)
    const cards = wrapper.findAll("ul[aria-label='Services'] a")
    expect(cards.map((card) => [card.text(), card.attributes("href")])).toEqual(
      [
        ["Universal RAG Agent", "/app/rag"],
        ["Voice Agent", "/app/voice"],
        ["Video Generator", "/app/video"],
      ]
    )
    wrapper.unmount()
  })
})

describe("sidebar home link", () => {
  const homeLink = (wrapper: Awaited<ReturnType<typeof mountAt>>) =>
    wrapper.findAll("a").find((link) => link.text() === "Home")

  it("is current on the home page", async () => {
    const wrapper = await mountAt("/app", CDashboardSidebar)
    expect(homeLink(wrapper)?.attributes("href")).toBe("/app")
    expect(homeLink(wrapper)?.attributes("aria-current")).toBe("page")
    wrapper.unmount()
  })

  it("stays inactive inside a service", async () => {
    const wrapper = await mountAt("/app/rag", CDashboardSidebar)
    expect(homeLink(wrapper)?.attributes("aria-current")).toBeUndefined()
    expect(homeLink(wrapper)?.classes()).not.toContain("bg-[#28272F]")
    wrapper.unmount()
  })
})

describe("sidebar language", () => {
  it("follows the interface language when it is switched", async () => {
    const i18n = createI18n({ legacy: false, locale: "uz", messages })
    const wrapper = await mountAt("/app", CDashboardSidebar, i18n)
    const labels = () => wrapper.findAll("nav a").map((link) => link.text())

    expect(labels()).toContain("Bosh sahifa")
    expect(labels()).toContain("Sozlamalar")

    i18n.global.locale.value = "ru"
    await flushPromises()

    expect(labels()).toContain("Главная")
    expect(labels()).toContain("Настройки")
    expect(wrapper.text()).toContain("Детали баланса")
    wrapper.unmount()
  })
})
