import { afterEach, describe, expect, it, vi } from "vitest"
import { createI18n } from "vue-i18n"
import { messages, pluralRules } from "@/shared/config/i18n"

type Tree = { [key: string]: Tree | Tree[] | string }

/** Every leaf message as a dotted path, arrays included. */
const leaves = (tree: Tree | Tree[] | string, path = ""): string[] => {
  if (typeof tree === "string") return [path]
  return Object.entries(tree).flatMap(([key, value]) =>
    leaves(value as Tree, path ? `${path}.${key}` : key)
  )
}

const dashboardKeys = (locale: keyof typeof messages) =>
  leaves((messages[locale] as unknown as Tree).dashboard as Tree, "dashboard")

afterEach(() => {
  vi.restoreAllMocks()
})

describe("locale files", () => {
  it("give the dashboard the same keys in every language", () => {
    const uz = dashboardKeys("uz").sort()
    expect(dashboardKeys("en").sort()).toEqual(uz)
    expect(dashboardKeys("ru").sort()).toEqual(uz)
  })

  it.each(["uz", "en", "ru"] as const)("%s messages all compile", (locale) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const { t } = createI18n({ legacy: false, locale, messages }).global
    for (const key of leaves(messages[locale] as unknown as Tree)) t(key)
    // A stray "@" or "|" in copy breaks message syntax; vue-i18n only warns.
    expect([...warn.mock.calls, ...error.mock.calls]).toEqual([])
  })

  it("picks Russian plural forms by the number's ending", () => {
    const { t } = createI18n({
      legacy: false,
      locale: "ru",
      messages: { ru: { files: "{n} файл | {n} файла | {n} файлов" } },
      pluralRules,
    }).global
    expect([1, 2, 5, 11, 21, 22, 0].map((n) => t("files", n))).toEqual([
      "1 файл",
      "2 файла",
      "5 файлов",
      "11 файлов",
      "21 файл",
      "22 файла",
      "0 файлов",
    ])
  })
})
