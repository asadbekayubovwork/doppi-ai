import { describe, it, expect } from "vitest"
import { messages } from "../src/shared/config/i18n"
import { SEO_PAGES, SERVICE_PATHS } from "../src/shared/config/seoPages"
import { SITE_URL } from "../src/shared/config/site"
import {
  message,
  outputFile,
  renderPage,
  renderRobots,
  renderShell,
  renderSitemap,
  structuredData,
} from "./seo"

type Tree = Record<string, unknown>

const template =
  "<!doctype html><html><head><title>Do'ppi.ai</title><!--seo--></head><body></body></html>"
const uz = messages.uz as Tree

const pageAt = (path: string) => {
  const page = SEO_PAGES.find((candidate) => candidate.path === path)
  if (!page) throw new Error(`no SEO page at ${path}`)
  return page
}

const graphTypes = (tree: Tree, path: string) =>
  (structuredData(tree, pageAt(path))["@graph"] as { "@type": string }[]).map((n) => n["@type"])

describe("build/seo", () => {
  it("gives every indexed page its own title, description and canonical on doppiai.uz", () => {
    for (const page of SEO_PAGES) {
      const html = renderPage(template, uz, page)
      const title = message(uz, `seo.${page.seoKey}.title`)

      expect(html).toContain(`<link rel="canonical" href="${SITE_URL}${page.path}"`)
      expect(html).toContain(`content="${message(uz, `seo.${page.seoKey}.description`)}"`)
      expect(html).toContain('<meta name="robots" content="index, follow"')
      // Titles use straight apostrophes, which need no escaping in text.
      expect(html).toContain(`<title>${title}</title>`)
      expect(html).not.toContain("<!--seo-->")
      // doppi.ai is an unrelated company; nothing may point search engines there.
      expect(html).not.toMatch(/https:\/\/doppi\.ai/)
    }
  })

  it("publishes the brand, the services and their FAQs as structured data", () => {
    expect(graphTypes(uz, "/")).toEqual(["Organization", "WebSite", "SoftwareApplication"])
    expect(graphTypes(uz, SERVICE_PATHS.voice)).toEqual([
      "Organization",
      "Service",
      "BreadcrumbList",
      "FAQPage",
    ])
    expect(graphTypes(uz, "/pricing")).toEqual(["Organization", "BreadcrumbList"])

    const data = structuredData(uz, pageAt(SERVICE_PATHS.rag))["@graph"] as Tree[]
    const faq = data.find((node) => node["@type"] === "FAQPage") as { mainEntity: unknown[] }
    const services = uz.services as { rag: { faq: { items: unknown[] } } }
    expect(faq.mainEntity).toHaveLength(services.rag.faq.items.length)
  })

  it("escapes message text in attributes and inside the JSON-LD script", () => {
    const tree = structuredClone(uz) as { seo: { home: Tree } } & Tree
    tree.seo.home.description = 'Say "hi" </script><b>'

    const html = renderPage(template, tree, pageAt("/"))

    expect(html).toContain('content="Say &quot;hi&quot; &lt;/script&gt;&lt;b&gt;"')
    expect(html).not.toContain("</script><b>")
    expect(html).toContain("\\u003c/script>")
  })

  it("keeps the app shell out of search", () => {
    const html = renderShell(template)

    expect(html).toContain('<meta name="robots" content="noindex, follow"')
    expect(html).not.toContain('rel="canonical"')
  })

  it("refuses a template that lost its marker", () => {
    expect(() => renderShell("<html><head><title>x</title></head></html>")).toThrow(/marker/)
  })

  it("names each file the way nginx looks it up", () => {
    expect(outputFile(pageAt("/"))).toBe("index.html")
    expect(outputFile(pageAt(SERVICE_PATHS.voice))).toBe("voice-agent.html")
  })

  it("lists exactly the indexed pages in the sitemap", () => {
    const locs = [...renderSitemap().matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])

    expect(locs).toEqual(SEO_PAGES.map((page) => `${SITE_URL}${page.path}`))
  })

  it("points robots.txt at the sitemap and away from the app", () => {
    const robots = renderRobots()

    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
    expect(robots).toContain("Disallow: /app/")
  })
})
