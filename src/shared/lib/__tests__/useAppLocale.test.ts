import { beforeEach, describe, expect, it } from "vitest"
import { defineComponent, h } from "vue"
import { mount } from "@vue/test-utils"
import { createI18n } from "vue-i18n"
import { messages, LOCALE_STORAGE_KEY } from "@/shared/config/i18n"

import { useAppLocale } from "../composables/useAppLocale"

const setup = () => {
  const i18n = createI18n({ legacy: false, locale: "uz", messages })
  let api!: ReturnType<typeof useAppLocale>
  mount(
    defineComponent({
      setup() {
        api = useAppLocale()
        return () => h("div")
      },
    }),
    { global: { plugins: [i18n] } }
  )
  return { i18n, api }
}

describe("shared/lib/composables/useAppLocale", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = "uz"
  })

  it("switches the interface, remembers the choice and updates <html lang>", () => {
    const { i18n, api } = setup()

    api.setLocale("ru")

    expect(i18n.global.locale.value).toBe("ru")
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ru")
    expect(document.documentElement.lang).toBe("ru")
  })

  it("ignores a language the site has no messages for", () => {
    const { i18n, api } = setup()

    api.setLocale("de")

    expect(i18n.global.locale.value).toBe("uz")
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull()
    expect(document.documentElement.lang).toBe("uz")
  })
})
