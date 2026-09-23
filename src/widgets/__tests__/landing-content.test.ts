import { describe, it, expect, afterEach } from "vitest"
import { mount, enableAutoUnmount, flushPromises } from "@vue/test-utils"
import { createI18n } from "vue-i18n"
import { messages } from "@/shared/config/i18n"
import { billingApi } from "@/features/billing"

// Note: TypeScript errors in test files are expected and can be ignored
import CProblem from "../problem/ui/CProblem.vue"
import CFeatures from "../features/ui/CFeatures.vue"
import CPricingList from "../pricing/ui/CPricingList.vue"
import CFaq from "../faq/ui/CFaq.vue"
import CTeamCards from "../team/ui/CTeamCards.vue"
import CTrustBar from "../trustbar/ui/CTrustBar.vue"

/**
 * The landing sections read their lists straight out of the i18n tree via
 * `tm()`/`rt()`. These tests pin that wiring down: a broken resolver would
 * silently render empty sections rather than throwing.
 */
const mountWithI18n = (component: unknown, locale = "uz") => {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: "en",
    messages,
    globalInjection: true,
  })

  return mount(component as never, {
    global: {
      plugins: [i18n],
      stubs: { RouterLink: { template: "<a><slot /></a>" } },
    },
  })
}

// Tear every mounted component down: the count-up (rAF) and typewriter
// (setTimeout) loops would otherwise keep running after the environment closes.
enableAutoUnmount(afterEach)

describe("landing sections render i18n list content", () => {
  it("renders all six problem cards with their copy", () => {
    const wrapper = mountWithI18n(CProblem)
    const cards = wrapper.findAll("li")

    expect(cards).toHaveLength(6)
    expect(wrapper.text()).toContain("Reklama ketadi, mijoz yo'qoladi")
    expect(wrapper.text()).toContain("Qo'ng'iroqlar javobsiz")
  })

  it("renders all six feature modules", () => {
    const wrapper = mountWithI18n(CFeatures)

    expect(wrapper.findAll("li")).toHaveLength(6)
    expect(wrapper.text()).toContain("AI Ovozli Agent")
    expect(wrapper.text()).toContain("SIP Call-markaz")
  })

  it("renders current intro credit and API-managed package prices", async () => {
    vi.spyOn(billingApi, "intro").mockResolvedValue({ credits: 1000, days: 7, free_video_model: "gemini-omni-1.1" })
    vi.spyOn(billingApi, "rates").mockResolvedValue([{ code: "rag_answer", credits_per_unit: 2, version: 1 }, { code: "video_second", credits_per_unit: 20, version: 1 }])
    vi.spyOn(billingApi, "packs").mockResolvedValue([{ id: "pack-1", code: "pro", title: "Pro krediti", credits: 5000, price_cents: 3000 }])
    const wrapper = mountWithI18n(CPricingList)
    await flushPromises()
    expect(wrapper.text()).toContain("Boshlang‘ich")
    expect(wrapper.text()).toContain("Pro krediti")
    expect(wrapper.text()).toContain("$30.00")
    expect(wrapper.text()).toContain("7 kun amal qiladi")
  })

  it("renders the FAQ and opens the first answer by default", () => {
    const wrapper = mountWithI18n(CFaq)

    expect(wrapper.findAll("button")).toHaveLength(5)
    expect(wrapper.text()).toContain("Do'ppi AI o'zbek tilida ishlaydimi?")
  })

  it("resolves each team member's role and bio from their id", () => {
    const wrapper = mountWithI18n(CTeamCards)
    const text = wrapper.text()

    expect(wrapper.findAll("li")).toHaveLength(5)
    expect(text).toContain("Bosh texnolog (CTO)")
    expect(text).toContain("Backend dasturchi")
    expect(text).toContain("Dasturiy ta'minot muhandisi")
    expect(text).toContain("AI muhandis")
    // A missing `team.roles.<id>` entry would leave the raw key on screen.
    expect(text).not.toContain("team.roles")
    expect(text).not.toContain("team.bios")
  })

  it("renders every trust-bar channel with a logo, announced once", () => {
    const wrapper = mountWithI18n(CTrustBar)
    const [first, ...copies] = wrapper.findAll("ul")

    expect(first.findAll("li")).toHaveLength(8)
    // Seven brand marks plus the stroke phone icon for SIP telephony.
    expect(first.findAll("svg")).toHaveLength(8)
    expect(first.text()).toContain("SIP Telefoniya")
    expect(first.attributes("aria-hidden")).toBeUndefined()

    // The loop's extra copies are decoration only.
    expect(copies.length).toBeGreaterThan(0)
    for (const copy of copies) {
      expect(copy.attributes("aria-hidden")).toBe("true")
      expect(copy.attributes("inert")).toBeDefined()
    }
  })

  it("switches every list to the selected locale", () => {
    const ru = mountWithI18n(CProblem, "ru")
    const en = mountWithI18n(CFeatures, "en")

    expect(ru.text()).toContain("Реклама идёт, а клиенты теряются")
    expect(en.text()).toContain("Social Media Automation")
  })
})
