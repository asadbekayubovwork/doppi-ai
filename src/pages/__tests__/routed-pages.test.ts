import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { createI18n } from "vue-i18n"
import { createHead } from "@unhead/vue/client"
import { createRouter, createWebHistory } from "vue-router"
import { messages } from "@/shared/config/i18n"

// Note: TypeScript errors in test files are expected and can be ignored
import PProduct from "../PProduct.vue"
import PPricing from "../PPricing.vue"
import PAboutUs from "../PAboutUs.vue"
import PContact from "../PContact.vue"
import PPrivacy from "../PPrivacy.vue"
import PTerms from "../PTerms.vue"
import PError from "../PError.vue"
import PService from "../PService.vue"
import { SERVICE_KEYS, SERVICE_PATHS } from "@/shared/config/seoPages"

/**
 * Every page reachable from the router gets mounted at least once, so a missing
 * i18n branch or a broken widget import surfaces here rather than as a blank
 * screen in production.
 */
const mountPage = (component: unknown, locale = "uz", props: Record<string, unknown> = {}) => {
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

  return mount(component as never, {
    props,
    global: { plugins: [i18n, router, createHead()] },
  })
}

describe("routed pages", () => {
  it("renders the product page with modules, audience and flow", () => {
    const wrapper = mountPage(PProduct)
    const text = wrapper.text()

    expect(wrapper.find("#solution").exists()).toBe(true)
    expect(wrapper.find("#features").exists()).toBe(true)
    expect(wrapper.find("#audience").exists()).toBe(true)
    expect(wrapper.find("#how").exists()).toBe(true)
    expect(wrapper.find("#voice").exists()).toBe(true)
    // Target audience is spelled out, not just implied.
    expect(text).toContain("Kichik biznes va yangi loyihalar")
    expect(text).toContain("Qo'ng'iroq bilan ishlaydigan kompaniyalar")
    wrapper.unmount()
  })

  it("renders the pricing page with all four tiers", () => {
    const wrapper = mountPage(PPricing)
    const text = wrapper.text()

    expect(text).toContain("Ochiq va tushunarli narxlar")
    expect(text).toContain("Starter")
    expect(text).toContain("Enterprise")
    expect(text).toContain("Ko'p so'raladigan savollar")
    wrapper.unmount()
  })

  it("renders the about page with the team", () => {
    const wrapper = mountPage(PAboutUs)

    expect(wrapper.find("#about").exists()).toBe(true)
    // The checklist wants the problem and the product described on About too.
    expect(wrapper.find("#problem").exists()).toBe(true)
    expect(wrapper.find("#solution").exists()).toBe(true)
    expect(wrapper.find("#team").exists()).toBe(true)
    expect(wrapper.text()).toContain("Jaxongir Abduxamidov")
    wrapper.unmount()
  })

  it("renders the contact page with the lead form", () => {
    const wrapper = mountPage(PContact)

    expect(wrapper.find("#contact-name").exists()).toBe(true)
    expect(wrapper.find("#contact-phone").exists()).toBe(true)
    expect(wrapper.find("#contact-message").exists()).toBe(true)

    // Company contact details: domain email, location and real social profiles
    // (a placeholder href would have been filtered out of SOCIALS entirely).
    const text = wrapper.text()
    expect(text).toContain("transformation@doppiai.uz")
    expect(text).toContain("Toshkent, O'zbekiston")
    const socialHrefs = wrapper.findAll('a[target="_blank"]').map((a) => a.attributes("href"))
    expect(socialHrefs).toContain("https://t.me/doppi_ai")
    expect(socialHrefs).toContain("https://instagram.com/doppi_ai")
    wrapper.unmount()
  })

  it("renders the privacy policy with every section", () => {
    const wrapper = mountPage(PPrivacy)
    const text = wrapper.text()

    expect(text).toContain("Maxfiylik siyosati")
    expect(text).toContain("Ma'lumotlar xavfsizligi")
    expect(text).toContain("transformation@doppiai.uz")
    wrapper.unmount()
  })

  it("renders the terms with numbered sections and bullet lists", () => {
    const wrapper = mountPage(PTerms)
    const text = wrapper.text()

    expect(text).toContain("Foydalanish shartlari")
    expect(text).toContain("Amaldagi qonun")
    // A section whose `bullets` array failed to resolve would drop this line.
    expect(text).toContain("AI ovozli agent — mijozlar bilan tabiiy suhbat")
    wrapper.unmount()
  })

  it.each(SERVICE_KEYS)("renders the %s service page with its own copy and links", (service) => {
    const wrapper = mountPage(PService, "uz", { service })
    const copy = messages.uz.services[service]

    expect(wrapper.find("h1").text()).toBe(copy.title)
    expect(wrapper.text()).toContain(copy.features.items[0].title)
    expect(wrapper.text()).toContain(copy.faq.items[0].q)

    // Links between the service pages are what tell crawlers these pages form
    // one section of the site.
    const hrefs = wrapper.findAll("a").map((a) => a.attributes("href"))
    for (const other of SERVICE_KEYS.filter((key) => key !== service)) {
      expect(hrefs).toContain(SERVICE_PATHS[other])
    }
    expect(hrefs).toContain("/")
    wrapper.unmount()
  })

  it("renders the 404 page", () => {
    const wrapper = mountPage(PError)

    expect(wrapper.text()).toContain("404")
    expect(wrapper.text()).toContain("Sahifa topilmadi")
    wrapper.unmount()
  })
})
