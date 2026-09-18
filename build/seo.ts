import { readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import type { Plugin } from "vite"
import { defaultLocale, messages } from "../src/shared/config/i18n"
import { SEO_PAGES, ogImageFor, type SeoPage } from "../src/shared/config/seoPages"
import {
  OG_IMAGE,
  SITE_ALTERNATE_NAMES,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "../src/shared/config/site"
import { SOCIALS } from "../src/shared/config/socials"

/**
 * The app is a single-page app, so without this every URL would serve the same
 * index.html and a crawler that doesn't run JavaScript (link previews in
 * Telegram and Facebook, Google's first pass) would see one generic head for
 * the whole site. After the build this writes, for every page in SEO_PAGES, an
 * HTML file with that page's title, description, canonical link, social tags
 * and structured data — plus sitemap.xml, robots.txt and a noindex shell
 * (app.html) that nginx serves for every other route.
 *
 * Static tags carry `data-seo`; main.ts drops them once the app boots and
 * useSeo takes over, so the head never holds two canonicals.
 */

const MARKER = "<!--seo-->"
const OG_LOCALE: Record<string, string> = { uz: "uz_UZ", ru: "ru_RU", en: "en_US" }

type Messages = Record<string, unknown>

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const lookup = (tree: Messages, key: string): unknown =>
  key.split(".").reduce<unknown>((node, part) => {
    return node && typeof node === "object" ? (node as Messages)[part] : undefined
  }, tree)

/** Reads a message as plain text, undoing vue-i18n literal escapes like {'@'}. */
export const message = (tree: Messages, key: string): string => {
  const value = lookup(tree, key)
  if (typeof value !== "string") throw new Error(`seo: missing message "${key}"`)
  return value.replace(/\{'([^']*)'\}/g, "$1")
}

const list = <T>(tree: Messages, key: string): T[] => {
  const value = lookup(tree, key)
  if (!Array.isArray(value)) throw new Error(`seo: missing list "${key}"`)
  return value as T[]
}

const organizationId = `${SITE_URL}/#organization`

const organization = (tree: Messages) => ({
  "@type": "Organization",
  "@id": organizationId,
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAMES,
  url: absoluteUrl("/"),
  logo: { "@type": "ImageObject", url: absoluteUrl(SITE_LOGO_PATH) },
  sameAs: SOCIALS.map((social) => social.href),
  address: { "@type": "PostalAddress", addressLocality: "Tashkent", addressCountry: "UZ" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: message(tree, "contact.phone").replace(/\s+/g, ""),
    contactType: "sales",
  },
})

const breadcrumb = (tree: Messages, page: SeoPage, name: string) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: message(tree, "services.breadcrumbHome"),
      item: absoluteUrl("/"),
    },
    { "@type": "ListItem", position: 2, name, item: absoluteUrl(page.path) },
  ],
})

/** Schema.org graph for a page: who publishes it, plus what the page is about. */
export const structuredData = (tree: Messages, page: SeoPage) => {
  const url = absoluteUrl(page.path)
  const description = message(tree, `seo.${page.seoKey}.description`)
  const image = absoluteUrl(ogImageFor(page))
  const graph: object[] = [organization(tree)]

  if (page.path === "/") {
    graph.push(
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        inLanguage: defaultLocale,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        url,
        description,
        image,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        // Starter plan, the lowest listed price on /pricing.
        offers: { "@type": "Offer", price: "19", priceCurrency: "USD" },
        publisher: { "@id": organizationId },
      }
    )
  } else if (page.service) {
    const base = `services.${page.service}`
    graph.push(
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: message(tree, `${base}.eyebrow`),
        description,
        url,
        image,
        provider: { "@id": organizationId },
      },
      breadcrumb(tree, page, message(tree, `${base}.name`)),
      {
        "@type": "FAQPage",
        mainEntity: list<{ q: string; a: string }>(tree, `${base}.faq.items`).map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }
    )
  } else {
    // "Narxlar — Do'ppi.ai" names the crumb "Narxlar".
    const name = message(tree, `seo.${page.seoKey}.title`).split(" — ")[0]
    graph.push(breadcrumb(tree, page, name))
  }

  return { "@context": "https://schema.org", "@graph": graph }
}

export const renderHead = (tree: Messages, page: SeoPage): string => {
  const title = message(tree, `seo.${page.seoKey}.title`)
  const description = message(tree, `seo.${page.seoKey}.description`)
  const url = absoluteUrl(page.path)
  const image = absoluteUrl(ogImageFor(page))
  // Only the home page carries keywords.
  const keywordsKey = `seo.${page.seoKey}.keywords`
  const keywords = lookup(tree, keywordsKey) === undefined ? "" : message(tree, keywordsKey)

  const meta = (attr: "name" | "property", key: string, content: string) =>
    `<meta ${attr}="${key}" content="${escapeHtml(content)}" data-seo />`

  // "<" inside JSON would let a message close the script element early.
  const json = JSON.stringify(structuredData(tree, page)).replace(/</g, "\\u003c")

  return [
    meta("name", "description", description),
    keywords ? meta("name", "keywords", keywords) : "",
    meta("name", "robots", "index, follow"),
    `<link rel="canonical" href="${escapeHtml(url)}" data-seo />`,
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", SITE_NAME),
    meta("property", "og:locale", OG_LOCALE[defaultLocale] ?? defaultLocale),
    meta("property", "og:url", url),
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    // Telegram and Facebook use width/height to lay the preview out before the
    // image arrives; without them a first share can show no picture.
    meta("property", "og:image", image),
    meta("property", "og:image:width", String(OG_IMAGE.width)),
    meta("property", "og:image:height", String(OG_IMAGE.height)),
    meta("property", "og:image:type", OG_IMAGE.type),
    meta("property", "og:image:alt", title),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", title),
    meta("name", "twitter:description", description),
    meta("name", "twitter:image", image),
    `<script type="application/ld+json">${json}</script>`,
  ]
    .filter(Boolean)
    .join("\n    ")
}

const fillTemplate = (template: string, title: string, head: string): string => {
  if (!template.includes(MARKER)) throw new Error(`seo: index.html has no ${MARKER} marker`)
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(MARKER, head)
}

export const renderPage = (template: string, tree: Messages, page: SeoPage): string =>
  fillTemplate(template, message(tree, `seo.${page.seoKey}.title`), renderHead(tree, page))

/** Shell for every route outside SEO_PAGES: sign-in, the dashboard, 404s. */
export const renderShell = (template: string): string =>
  fillTemplate(template, SITE_NAME, `<meta name="robots" content="noindex, follow" data-seo />`)

/** "/" -> "index.html", "/voice-agent" -> "voice-agent.html" (see nginx try_files). */
export const outputFile = (page: SeoPage): string =>
  page.path === "/" ? "index.html" : `${page.path.slice(1)}.html`

export const renderSitemap = (): string =>
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...SEO_PAGES.map(
      (page) =>
        `  <url>\n    <loc>${absoluteUrl(page.path)}</loc>\n    <priority>${page.priority.toFixed(1)}</priority>\n  </url>`
    ),
    `</urlset>`,
    ``,
  ].join("\n")

export const renderRobots = (): string =>
  [
    `# Generated by build/seo.ts from SEO_PAGES.`,
    `User-agent: *`,
    `Allow: /`,
    `Disallow: /app/`,
    `Disallow: /api/`,
    ``,
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    ``,
  ].join("\n")

export function seoPages(): Plugin {
  let outDir = "dist"

  return {
    name: "doppi-seo-pages",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const tree = messages[defaultLocale as keyof typeof messages] as Messages
      const template = await readFile(join(outDir, "index.html"), "utf8")

      await writeFile(join(outDir, "app.html"), renderShell(template))
      for (const page of SEO_PAGES) {
        await writeFile(join(outDir, outputFile(page)), renderPage(template, tree, page))
      }
      await writeFile(join(outDir, "sitemap.xml"), renderSitemap())
      await writeFile(join(outDir, "robots.txt"), renderRobots())
    },
  }
}
