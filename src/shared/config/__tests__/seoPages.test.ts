import { describe, it, expect } from "vitest"
import { createMemoryHistory, createRouter } from "vue-router"
import { routes } from "@/pages"
import { messages } from "@/shared/config/i18n"
import { SEO_PAGES, SERVICE_KEYS, findSeoPage } from "@/shared/config/seoPages"

type Locale = keyof typeof messages

const locales = Object.keys(messages) as Locale[]

const lookup = (tree: unknown, key: string): unknown =>
  key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], tree)

describe("SEO pages", () => {
  const router = createRouter({ history: createMemoryHistory(), routes })

  it.each(SEO_PAGES.map((page) => page.path))("%s is a real route, not the 404 page", (path) => {
    expect(router.resolve(path).name).not.toBe("NotFound")
  })

  it.each(locales)("%s has a title and description for every indexed page", (locale) => {
    for (const page of SEO_PAGES) {
      for (const field of ["title", "description"]) {
        const key = `seo.${page.seoKey}.${field}`
        const value = lookup(messages[locale], key)

        expect(typeof value, `${locale}: ${key}`).toBe("string")
        // vue-i18n reads "|" as a plural separator and would cut the text short.
        expect(value, `${locale}: ${key}`).not.toContain("|")
      }
    }
  })

  it.each(locales)("%s carries the same service copy as uz, item for item", (locale) => {
    const shape = (tree: unknown) =>
      SERVICE_KEYS.map((service) =>
        ["features", "steps"].map(
          (section) => (lookup(tree, `services.${service}.${section}.items`) as unknown[]).length
        )
      )

    expect(shape(messages[locale])).toEqual(shape(messages.uz))
  })

  it("treats a trailing slash as the same page and ignores unlisted routes", () => {
    expect(findSeoPage("/voice-agent/")?.path).toBe("/voice-agent")
    expect(findSeoPage("/")?.path).toBe("/")
    expect(findSeoPage("/login")).toBeUndefined()
    expect(findSeoPage("/app/rag")).toBeUndefined()
  })
})
