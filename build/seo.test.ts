import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it, expect } from "vitest"
import { messages } from "../src/shared/config/i18n"
import { SEO_PAGES, SERVICE_PATHS, ogImageFor } from "../src/shared/config/seoPages"
import { OG_IMAGE, SITE_URL } from "../src/shared/config/site"
import { TEAM_MEMBERS } from "../src/shared/config/team"
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
  "<!doctype html><html><head><title>Do'ppi AI</title><!--seo--></head><body></body></html>"
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

  it("gives every page a link-preview image that exists at the advertised size", () => {
    for (const page of SEO_PAGES) {
      const html = renderPage(template, uz, page)
      const src = ogImageFor(page)

      expect(html).toContain(`<meta property="og:image" content="${SITE_URL}${src}"`)
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image"')

      // A missing file or a size that disagrees with og:image:width/height is
      // what makes Telegram fall back to a preview with no picture.
      // Vite rewrites `new URL(…, import.meta.url)` as an asset import, so build
      // the path by hand.
      const png = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../public", src))
      expect([png.readUInt32BE(16), png.readUInt32BE(20)], src).toEqual([
        OG_IMAGE.width,
        OG_IMAGE.height,
      ])
    }
    expect(ogImageFor(pageAt(SERVICE_PATHS.voice))).toBe("/og/voice.png")
  })

  it("publishes the brand and the services as structured data", () => {
    expect(graphTypes(uz, "/")).toEqual(["Organization", "WebSite", "SoftwareApplication"])
    // The service landings carry no FAQ, so they claim none: structured data
    // may only describe what is visible on the page.
    expect(graphTypes(uz, SERVICE_PATHS.voice)).toEqual([
      "Organization",
      "Service",
      "BreadcrumbList",
    ])
    expect(graphTypes(uz, "/pricing")).toEqual(["Organization", "BreadcrumbList"])
  })

  it("names the team and how to reach the company on every page", () => {
    for (const page of SEO_PAGES) {
      const [organization] = structuredData(uz, page)["@graph"] as {
        email: string
        employee: { name: string; jobTitle: string; sameAs: string[] }[]
      }[]

      expect(organization.email).toBe("transformation@doppiai.uz")
      expect(organization.employee.map((person) => person.name)).toEqual(
        TEAM_MEMBERS.map((member) => member.name)
      )
      for (const person of organization.employee) {
        expect(person.jobTitle).toBeTruthy()
        // Placeholder "#" profiles must not reach structured data.
        expect(person.sameAs.every((href) => href.startsWith("https://"))).toBe(true)
      }
    }
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
