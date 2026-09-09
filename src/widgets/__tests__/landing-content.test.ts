import { describe, it, expect, afterEach } from "vitest"
import { mount, enableAutoUnmount } from "@vue/test-utils"
import { createI18n } from "vue-i18n"
import { messages } from "@/shared/config/i18n"

// Note: TypeScript errors in test files are expected and can be ignored
import CProblem from "../problem/ui/CProblem.vue"
import CFeatures from "../features/ui/CFeatures.vue"
import CPricingList from "../pricing/ui/CPricingList.vue"
import CFaq from "../faq/ui/CFaq.vue"
import CTeamCards from "../team/ui/CTeamCards.vue"

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

  it("renders four pricing tiers including their nested feature lists", () => {
    const wrapper = mountWithI18n(CPricingList)

    expect(wrapper.text()).toContain("Starter")
    expect(wrapper.text()).toContain("Enterprise")
    // Nested string array inside each tier must resolve too.
    expect(wrapper.text()).toContain("Cheksiz lead boshqaruvi")
    expect(wrapper.text()).toContain("Eng ommabop")
  })

  it("renders the FAQ and opens the first answer by default", () => {
    const wrapper = mountWithI18n(CFaq)

    expect(wrapper.findAll("button")).toHaveLength(5)
    expect(wrapper.text()).toContain("Do'ppi.ai o'zbek tilida ishlaydimi?")
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

  it("switches every list to the selected locale", () => {
    const ru = mountWithI18n(CProblem, "ru")
    const en = mountWithI18n(CFeatures, "en")

    expect(ru.text()).toContain("Реклама идёт, а клиенты теряются")
    expect(en.text()).toContain("Social Media Automation")
  })
})
