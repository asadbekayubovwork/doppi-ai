import { describe, it, expect, afterEach } from "vitest"
import { mount, enableAutoUnmount, flushPromises } from "@vue/test-utils"
import { createI18n } from "vue-i18n"
import { messages } from "@/shared/config/i18n"

// Note: TypeScript errors in test files are expected and can be ignored
import CFeatures from "../features/ui/CFeatures.vue"
import CPricingList from "../pricing/ui/CPricingList.vue"
import CCreditCosts from "../pricing/ui/CCreditCosts.vue"
import CTopUpPacks from "../pricing/ui/CTopUpPacks.vue"
import CFaq from "../faq/ui/CFaq.vue"
import CTeamCards from "../team/ui/CTeamCards.vue"
import CTrustBar from "../trustbar/ui/CTrustBar.vue"

/**
 * The landing sections read their lists straight out of the i18n tree via
 * `tm()`/`rt()`. These tests pin that wiring down: a broken resolver would
 * silently render empty sections rather than throwing.
 */
const mountWithI18n = (component: unknown, locale = "uz", props = {}) => {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: "en",
    messages,
    globalInjection: true,
  })

  return mount(component as never, {
    props: props as never,
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
  it("renders all six feature modules", () => {
    const wrapper = mountWithI18n(CFeatures)

    expect(wrapper.findAll("li")).toHaveLength(6)
    expect(wrapper.text()).toContain("AI Ovozli Agent")
    expect(wrapper.text()).toContain("SIP Call-markaz")
  })

  it("prices the plans monthly and switches to the yearly discount", async () => {
    const wrapper = mountWithI18n(CPricingList)
    const prices = () => wrapper.findAll("span.text-4xl").map((el) => el.text())

    expect(wrapper.findAll("h3").map((h) => h.text())).toEqual(["Starter", "Pro", "Business"])
    expect(prices()).toEqual(["$20", "$60", "$150"])
    expect(wrapper.text()).toMatch(/18\s000 kredit \/ oyiga/)
    expect(wrapper.text()).toContain("+33% bonus")
    // Starter lists what it lacks, crossed out.
    expect(wrapper.text().match(/Kirmaydi/g)).toHaveLength(2)

    const yearly = wrapper.findAll("[aria-pressed]").find((b) => b.text().includes("Yillik"))
    await yearly!.trigger("click")
    await flushPromises()

    expect(prices()).toEqual(["$16", "$48", "$120"])
    expect(wrapper.text()).toContain("Yiliga $1,440 to'lanadi")
  })

  it("prices every credit cost off the $0.004 credit", () => {
    const wrapper = mountWithI18n(CCreditCosts)

    expect(wrapper.findAll("tbody tr")).toHaveLength(7)
    expect(wrapper.text()).toContain("1 kredit = $0.004")
    expect(wrapper.text()).toContain("25 kredit")
    expect(wrapper.text()).toContain("≈ $0.10")
  })

  it("shows each top-up pack with its per-credit price", () => {
    const wrapper = mountWithI18n(CTopUpPacks)

    expect(wrapper.text()).toContain("$22.00")
    expect(wrapper.text()).toContain("$0.0044 / kredit")
    expect(wrapper.text()).toContain("Tejamkor")
  })

  it("renders the pricing FAQ from its own i18n node", () => {
    const wrapper = mountWithI18n(CFaq, "uz", { base: "pricing.faq" })

    expect(wrapper.findAll("button")).toHaveLength(3)
    expect(wrapper.text()).toContain("Kreditlarim tugab qolsa nima bo'ladi?")
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
    const ru = mountWithI18n(CFeatures, "ru")
    const en = mountWithI18n(CFeatures, "en")

    expect(ru.text()).toContain("Автоматизация соцсетей")
    expect(en.text()).toContain("Social Media Automation")
  })
})
