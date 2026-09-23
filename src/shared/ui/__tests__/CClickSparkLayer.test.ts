import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount, type VueWrapper } from "@vue/test-utils"
import type { MockInstance } from "vitest"

// Note: TypeScript errors in test files are expected and can be ignored
import CClickSparkLayer from "../CClickSparkLayer.vue"

/**
 * The layer listens on the document, so these tests pin down what is easy to
 * break silently: only marked elements burst, the frame loop and the canvas
 * backing store are released once the sparks die, and nothing outlives unmount.
 */
describe("CClickSparkLayer", () => {
  let raf: MockInstance<[callback: FrameRequestCallback], number>
  let layer: VueWrapper | null = null
  let ctx: Record<string, ReturnType<typeof vi.fn>>

  beforeEach(() => {
    // jsdom has no 2D canvas; a recording stub is enough to drive the loop.
    ctx = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    }
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as never
    )
    raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1)
  })

  afterEach(() => {
    layer?.unmount()
    layer = null
    vi.restoreAllMocks()
    document.body.innerHTML = ""
  })

  const setup = () => {
    layer = mount(CClickSparkLayer, { attachTo: document.body })
    const cta = document.createElement("a")
    cta.innerHTML = "<span>Demo</span>"
    const field = document.createElement("input")
    const quiet = document.createElement("div")
    quiet.setAttribute("data-click-spark", "off")
    quiet.innerHTML = "<button>Quiet</button>"
    document.body.append(cta, field, quiet)
    const canvas = layer.find("canvas").element as HTMLCanvasElement
    return { cta, field, quiet, canvas }
  }

  const clickAt = (el: Element) =>
    el.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        clientX: 40,
        clientY: 20,
        detail: 1,
      })
    )

  it("bursts wherever the page is clicked", () => {
    const { cta, canvas } = setup()

    clickAt(cta.querySelector("span")!)
    expect(raf).toHaveBeenCalledTimes(1)
    expect(canvas.width).toBeGreaterThan(0)

    // A second click joins the burst already in flight rather than starting
    // a second loop; both bursts are drawn on the next frame.
    clickAt(document.body)
    expect(raf).toHaveBeenCalledTimes(1)

    const draw = raf.mock.calls[0][0] as FrameRequestCallback
    draw(performance.now())
    expect(ctx.moveTo).toHaveBeenCalledTimes(16)
  })

  it("stays quiet over text fields and opted-out subtrees", () => {
    const { field, quiet, canvas } = setup()

    clickAt(field)
    clickAt(quiet.querySelector("button")!)

    expect(raf).not.toHaveBeenCalled()
    expect(canvas.width).toBe(0)
  })

  it("stays quiet for the click that ends a text selection", () => {
    const { cta, canvas } = setup()
    const range = document.createRange()
    range.selectNodeContents(cta)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    clickAt(cta)
    expect(raf).not.toHaveBeenCalled()
    expect(canvas.width).toBe(0)

    selection.removeAllRanges()
    clickAt(cta)
    expect(raf).toHaveBeenCalledTimes(1)
  })

  it("stops the loop and frees the canvas once every spark has died", () => {
    const { cta, canvas } = setup()
    clickAt(cta)

    const draw = raf.mock.calls[0][0] as FrameRequestCallback
    raf.mockClear()
    draw(performance.now() + 10_000)

    expect(raf).not.toHaveBeenCalled()
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
  })

  it("stops listening once unmounted", () => {
    const { cta } = setup()
    layer?.unmount()
    layer = null

    clickAt(cta)
    expect(raf).not.toHaveBeenCalled()
  })
})
