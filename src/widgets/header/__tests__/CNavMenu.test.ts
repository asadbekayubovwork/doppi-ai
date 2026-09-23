import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { createI18n } from "vue-i18n"
import { createRouter, createWebHistory } from "vue-router"
import { messages } from "@/shared/config/i18n"
import { SERVICE_PATHS } from "@/shared/config/seoPages"

// Note: TypeScript errors in test files are expected and can be ignored
import CNavMenu from "../ui/CNavMenu.vue"
import { RESOURCES_MENU, SERVICES_MENU, type NavMenuColumn } from "../model/navMenus"

const MENUS = {
  services: { id: "services-menu", label: "services.navLabel", columns: SERVICES_MENU },
  resources: { id: "resources-menu", label: "nav.resources", columns: RESOURCES_MENU },
}

const mountMenu = (menu: keyof typeof MENUS, locale = "uz") => {
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

  return mount(CNavMenu as never, {
    props: MENUS[menu],
    global: { plugins: [i18n, router] },
  })
}

const soonCount = (columns: NavMenuColumn[]) =>
  columns.flatMap((column) => column.items).filter((item) => !item.to).length

describe("CNavMenu", () => {
  it("links every live service and tags the rest as coming soon", () => {
    const wrapper = mountMenu("services")
    const hrefs = wrapper.findAll("#services-menu a").map((a) => a.attributes("href"))

    expect(hrefs).toEqual(expect.arrayContaining(Object.values(SERVICE_PATHS)))
    expect(wrapper.text()).toContain("Ovozli agent yechimlari")
    expect(wrapper.text()).toContain("Sohalar")
    expect(wrapper.text().match(/Tez kunda/g)).toHaveLength(soonCount(SERVICES_MENU))
  })

  it("lists blog and languages as coming soon and links contact", () => {
    const wrapper = mountMenu("resources")
    const hrefs = wrapper.findAll("#resources-menu a").map((a) => a.attributes("href"))

    expect(wrapper.find("button").text()).toContain("Resurslar")
    expect(hrefs).toEqual(["/contact-us"])
    expect(wrapper.text().match(/Tez kunda/g)).toHaveLength(soonCount(RESOURCES_MENU))
  })

  it.each(["uz", "en", "ru"])("%s resolves every label", (locale) => {
    for (const menu of ["services", "resources"] as const) {
      // An unresolved key renders as the key path itself.
      expect(mountMenu(menu, locale).text()).not.toMatch(/services\.|nav\./)
    }
  })

  it("opens on hover and closes on Escape", async () => {
    const wrapper = mountMenu("services")
    const trigger = wrapper.find("button")

    await wrapper.trigger("mouseenter")
    expect(trigger.attributes("aria-expanded")).toBe("true")

    await wrapper.trigger("keydown", { key: "Escape" })
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })
})
