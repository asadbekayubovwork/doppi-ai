// The callback passed to page.$eval runs in the browser, on DOM types.
/// <reference lib="dom" />
import { readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import type { Browser } from "puppeteer"
import type { Plugin, ResolvedConfig } from "vite"
import { SEO_PAGES } from "../src/shared/config/seoPages"
import { outputFile } from "./seo"

/**
 * build/seo.ts gives every public page its own head, but the body is still the
 * empty `<div id="app"></div>` the SPA mounts into — so anything that reads the
 * HTML without running JavaScript (business verification, link previews,
 * Google's first pass) sees a site with no product, team or text on it.
 *
 * After the build this opens each public page of the finished bundle in
 * headless Chrome, served by `vite preview` with the same /api proxy as dev,
 * and writes what the app rendered into that page's `#app`. The client still
 * mounts from scratch (main.ts) — the static copy is replaced, not hydrated,
 * so nothing here has to be SSR-safe.
 *
 * Set SKIP_PRERENDER=1 to build without a browser; the pages then ship with
 * their SEO head and an empty body, as before.
 */

const EMPTY_APP = '<div id="app"></div>'

/**
 * Public pages outside SEO_PAGES that still need readable HTML: a reviewer
 * checking the business looks for the legal pages. They keep the noindex shell.
 */
const SHELL_PATHS = ["/privacy", "/terms"]

export interface PrerenderRoute {
  path: string
  /** File in the build output that nginx serves for `path`. */
  file: string
  /** True when the file starts as a copy of the noindex app shell. */
  shell: boolean
}

export const prerenderRoutes = (): PrerenderRoute[] => [
  ...SEO_PAGES.map((page) => ({
    path: page.path,
    file: outputFile(page),
    shell: false,
  })),
  ...SHELL_PATHS.map((path) => ({
    path,
    file: `${path.slice(1)}.html`,
    shell: true,
  })),
]

export const injectApp = (template: string, html: string): string => {
  if (!template.includes(EMPTY_APP))
    throw new Error(`prerender: no empty ${EMPTY_APP} to fill`)
  // A replacer function, so "$&" or "$'" in page text is not read as a pattern.
  return template.replace(EMPTY_APP, () => `<div id="app">${html}</div>`)
}

const TIMEOUT = 20_000

async function snapshot(
  browser: Browser,
  origin: string,
  path: string
): Promise<string> {
  const page = await browser.newPage()
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(String(error)))

  try {
    // The app honours reduced motion, so count-ups and typewriters render
    // their final text instead of whatever frame the snapshot lands on.
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ])
    await page.setViewport({ width: 1440, height: 900 })

    // Only the app and its /api: third-party widgets and media add nothing to
    // the markup, and a stalled one would hold up the network-idle wait.
    await page.setRequestInterception(true)
    page.on("request", (request) => {
      const allowed =
        new URL(request.url()).origin === origin &&
        !["image", "media", "font"].includes(request.resourceType())
      void (allowed ? request.continue() : request.abort())
    })

    await page.goto(`${origin}${path}`, { waitUntil: "load", timeout: TIMEOUT })
    // Pricing fills in from the billing API after mount; a request that never
    // settles is not worth failing the build over.
    await page
      .waitForNetworkIdle({ idleTime: 500, timeout: TIMEOUT })
      .catch(() => undefined)
    // Every public page has an h1; without one the page did not render.
    await page.waitForSelector("#app h1", { timeout: TIMEOUT }).catch(() => {
      throw new Error(
        `prerender: ${path} rendered no <h1>${errors.length ? `\n${errors.join("\n")}` : ""}`
      )
    })

    return await page.$eval("#app", (app) => {
      // AOS marks elements it has revealed. Dropping the marks leaves them in
      // their pre-reveal state, so the mounted app fades them in once rather
      // than hiding and re-showing what the static copy already showed.
      app.querySelectorAll(".aos-init, .aos-animate").forEach((el) => {
        el.classList.remove("aos-init", "aos-animate")
      })
      return app.innerHTML
    })
  } finally {
    await page.close()
  }
}

async function prerender(config: ResolvedConfig): Promise<void> {
  const outDir = resolve(config.root, config.build.outDir)
  const routes = prerenderRoutes()
  const shell = await readFile(join(outDir, "app.html"), "utf8")

  // Loaded here rather than at the top so `vite dev` never pulls in Chrome.
  const [{ preview }, { default: puppeteer }] = await Promise.all([
    import("vite"),
    import("puppeteer"),
  ])

  const server = await preview({
    root: config.root,
    base: config.base,
    configFile: false,
    logLevel: "silent",
    build: { outDir: config.build.outDir },
    preview: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: false,
      proxy: config.server.proxy,
    },
  })
  // GitHub's Ubuntu runners block the unprivileged user namespaces Chrome's
  // sandbox needs; the only page loaded here is our own build.
  const browser = await puppeteer.launch({
    args: process.env.CI ? ["--no-sandbox"] : [],
  })

  try {
    const url = server.resolvedUrls?.local[0]
    if (!url) throw new Error("prerender: vite preview reported no local URL")
    const origin = new URL(url).origin

    // All pages are captured before any file changes, so every snapshot comes
    // from the bundle exactly as built.
    const pages: { route: PrerenderRoute; html: string }[] = []
    for (const route of routes) {
      pages.push({ route, html: await snapshot(browser, origin, route.path) })
    }

    for (const { route, html } of pages) {
      const file = join(outDir, route.file)
      const template = route.shell ? shell : await readFile(file, "utf8")
      await writeFile(file, injectApp(template, html))
    }
    config.logger.info(`prerendered ${pages.length} pages`)
  } finally {
    await browser.close()
    await server.close()
  }
}

export function prerenderPages(): Plugin {
  let config: ResolvedConfig

  return {
    name: "doppi-prerender",
    apply: "build",
    configResolved(resolved) {
      config = resolved
    },
    // closeBundle hooks run in parallel; this one waits for build/seo.ts to
    // write the page files it fills in.
    closeBundle: {
      order: "post",
      sequential: true,
      async handler() {
        if (process.env.SKIP_PRERENDER) {
          config.logger.warn(
            "prerender: skipped (SKIP_PRERENDER is set); pages ship empty bodies"
          )
          return
        }
        await prerender(config)
      },
    },
  }
}
