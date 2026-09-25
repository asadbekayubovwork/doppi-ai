import { describe, it, expect } from "vitest"
import { SEO_PAGES } from "../src/shared/config/seoPages"
import { injectApp, prerenderRoutes } from "./prerender"

const template =
  '<html><body><div id="app"></div><script src="/x.js"></script></body></html>'

describe("build/prerender", () => {
  it("renders every indexed page into the file nginx serves for it", () => {
    const routes = prerenderRoutes()

    for (const page of SEO_PAGES) {
      expect(routes).toContainEqual(
        expect.objectContaining({ path: page.path, shell: false })
      )
    }
    expect(routes.find((route) => route.path === "/")?.file).toBe("index.html")
    expect(routes.find((route) => route.path === "/pricing")?.file).toBe(
      "pricing.html"
    )
  })

  it("gives the legal pages readable HTML while keeping them on the noindex shell", () => {
    const routes = prerenderRoutes()

    expect(routes).toContainEqual({
      path: "/privacy",
      file: "privacy.html",
      shell: true,
    })
    expect(routes).toContainEqual({
      path: "/terms",
      file: "terms.html",
      shell: true,
    })
  })

  it("fills the empty mount point and leaves the rest of the page alone", () => {
    const html = injectApp(template, "<h1>Do'ppi AI</h1>")

    expect(html).toBe(
      '<html><body><div id="app"><h1>Do\'ppi AI</h1></div><script src="/x.js"></script></body></html>'
    )
  })

  it("keeps dollar signs in page text literal", () => {
    // "$&" and "$'" are replacement patterns to String#replace.
    expect(injectApp(template, "<p>$20 $& $'</p>")).toContain(
      '<div id="app"><p>$20 $& $\'</p></div>'
    )
  })

  it("refuses a page whose mount point is missing or already filled", () => {
    expect(() => injectApp("<body></body>", "<h1>x</h1>")).toThrow(/no empty/)
    expect(() =>
      injectApp(injectApp(template, "<h1>x</h1>"), "<h1>y</h1>")
    ).toThrow(/no empty/)
  })
})
