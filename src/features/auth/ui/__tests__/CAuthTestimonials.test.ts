import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import CAuthTestimonials from "../CAuthTestimonials.vue"

const ROTATE_MS = 6000

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

const dots = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('[role="tab"]')

describe("auth testimonial carousel", () => {
  it("rotates to the next quote on its own and wraps around", async () => {
    const wrapper = mount(CAuthTestimonials)
    const total = dots(wrapper).length
    expect(total).toBeGreaterThan(1)

    const first = wrapper.get("blockquote").text()
    await vi.advanceTimersByTimeAsync(ROTATE_MS)
    expect(wrapper.get("blockquote").text()).not.toBe(first)

    // Back to the start after a full lap.
    await vi.advanceTimersByTimeAsync(ROTATE_MS * (total - 1))
    expect(wrapper.get("blockquote").text()).toBe(first)
    wrapper.unmount()
  })

  it("marks the active dot and jumps to the quote it names", async () => {
    const wrapper = mount(CAuthTestimonials)
    expect(dots(wrapper)[0].attributes("aria-selected")).toBe("true")

    await dots(wrapper)[2].trigger("click")
    expect(dots(wrapper)[2].attributes("aria-selected")).toBe("true")
    expect(wrapper.get("blockquote").text()).toContain(
      dots(wrapper)[2].attributes("aria-label")
    )
    wrapper.unmount()
  })

  it("holds still while the pointer rests on the card", async () => {
    const wrapper = mount(CAuthTestimonials)
    const quote = wrapper.get("blockquote").text()

    await wrapper.get("figure").trigger("mouseenter")
    await vi.advanceTimersByTimeAsync(ROTATE_MS * 2)
    expect(wrapper.get("blockquote").text()).toBe(quote)

    await wrapper.get("figure").trigger("mouseleave")
    await vi.advanceTimersByTimeAsync(ROTATE_MS)
    expect(wrapper.get("blockquote").text()).not.toBe(quote)
    wrapper.unmount()
  })

  it("stops its timer once unmounted", async () => {
    const wrapper = mount(CAuthTestimonials)
    wrapper.unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
