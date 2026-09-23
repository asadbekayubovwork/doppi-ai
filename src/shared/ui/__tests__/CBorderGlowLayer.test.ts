import { mount, type VueWrapper } from "@vue/test-utils"
import type { MockInstance } from "vitest"
import CBorderGlowLayer from "../CBorderGlowLayer.vue"

/**
 * The layer listens on the document, so these tests pin down what is easy to
 * break silently: only hoverable cards light up, the glow faces the pointer,
 * a card that is left fades and frees its layer, and nothing outlives unmount.
 */
describe("CBorderGlowLayer", () => {
  let raf: MockInstance<[callback: FrameRequestCallback], number>
  let layer: VueWrapper | null = null

  beforeEach(() => {
    raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1)
  })

  afterEach(() => {
    layer?.unmount()
    layer = null
    vi.restoreAllMocks()
    document.body.innerHTML = ""
  })

  const card = (attributes: Record<string, string> = {}) => {
    const el = document.createElement("div")
    el.className = "surface-card surface-card-lift"
    el.innerHTML = "<p>Card</p>"
    for (const [key, value] of Object.entries(attributes))
      el.setAttribute(key, value)
    // 200×100 at (100, 100).
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue(
      new DOMRect(100, 100, 200, 100)
    )
    document.body.append(el)
    return el
  }

  const setup = () => {
    layer = mount(CBorderGlowLayer, { attachTo: document.body })
    return layer
      .findAll(".border-glow")
      .map((item) => item.element as HTMLElement)
  }

  const move = (
    target: Element,
    x: number,
    y: number,
    pointerType = "mouse"
  ) => {
    const event = new MouseEvent("pointermove", {
      bubbles: true,
      clientX: x,
      clientY: y,
    })
    Object.defineProperty(event, "pointerType", { value: pointerType })
    target.dispatchEvent(event)
  }

  it("lights the hovered card up, facing the pointer", () => {
    const [glow] = setup()
    const target = card()

    // Near the right edge, level with the centre.
    move(target.querySelector("p")!, 296, 150)

    expect(glow.dataset.state).toBe("active")
    expect(glow.style.transform).toBe("translate(100px, 100px)")
    expect(glow.style.width).toBe("200px")
    expect(glow.style.getPropertyValue("--glow-angle")).toBe("90.00deg")
    expect(Number(glow.style.getPropertyValue("--glow-halo"))).toBeGreaterThan(
      0.9
    )
    expect(raf).toHaveBeenCalledTimes(1)
  })

  it("keeps the centre dark and brightens towards the edge", () => {
    const [glow] = setup()
    const target = card()

    move(target, 200, 150)
    expect(glow.style.getPropertyValue("--glow-halo")).toBe("0.000")
    move(target, 280, 150)
    expect(Number(glow.style.getPropertyValue("--glow-halo"))).toBeGreaterThan(
      0.5
    )
  })

  it("ignores opted-out cards and touch", () => {
    const glows = setup()
    const quiet = card({ "data-border-glow": "off" })
    const plain = card()

    move(quiet, 296, 150)
    move(plain, 296, 150, "touch")

    expect(glows.map((glow) => glow.dataset.state)).toEqual(["idle", "idle"])
    expect(raf).not.toHaveBeenCalled()
  })

  it("fades a card that is left and frees its layer", () => {
    const [first, second] = setup()
    const a = card()
    const b = card()

    move(a, 296, 150)
    move(b, 296, 150)
    expect(first.dataset.state).toBe("leaving")
    expect(second.dataset.state).toBe("active")

    const tick = raf.mock.calls[0][0] as FrameRequestCallback
    tick(performance.now() + 1000)
    expect(first.dataset.state).toBe("idle")
    expect(second.dataset.state).toBe("active")
  })

  it("stops listening once unmounted", () => {
    const [glow] = setup()
    const target = card()
    layer?.unmount()
    layer = null

    move(target, 296, 150)
    expect(glow.dataset.state).toBe("idle")
  })
})
