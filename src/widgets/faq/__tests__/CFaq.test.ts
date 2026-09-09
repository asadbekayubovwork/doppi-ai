import { describe, it, expect, afterEach } from "vitest"
import { mount, enableAutoUnmount } from "@vue/test-utils"
import { createI18n } from "vue-i18n"
import { messages } from "@/shared/config/i18n"

// Note: TypeScript errors in test files are expected and can be ignored
import CFaq from "../ui/CFaq.vue"

const mountFaq = () => {
  const i18n = createI18n({
    legacy: false,
    locale: "uz",
    fallbackLocale: "en",
    messages,
    globalInjection: true,
  })

  return mount(CFaq as never, { global: { plugins: [i18n] } })
}

// Tear every mounted component down: the count-up (rAF) and typewriter
// (setTimeout) loops would otherwise keep running after the environment closes.
enableAutoUnmount(afterEach)

describe("CFaq accordion", () => {
  it("opens the first answer by default and marks it expanded", () => {
    const wrapper = mountFaq()
    const triggers = wrapper.findAll("button")

    expect(triggers[0].attributes("aria-expanded")).toBe("true")
    expect(triggers[1].attributes("aria-expanded")).toBe("false")
  })

  it("opens the clicked row and closes the previously open one", async () => {
    const wrapper = mountFaq()
    const triggers = wrapper.findAll("button")

    await triggers[2].trigger("click")

    // Both halves of the swap flip in the same tick, so the opening row and the
    // closing row animate together rather than one after the other.
    expect(triggers[2].attributes("aria-expanded")).toBe("true")
    expect(triggers[0].attributes("aria-expanded")).toBe("false")
    // The answer body stays in the DOM — v-show only toggles it.
    expect(wrapper.find("#faq-panel-2").exists()).toBe(true)
  })

  it("keeps AOS's runtime class on the animated wrapper when a row is toggled", async () => {
    const wrapper = mountFaq()

    // Whichever ancestor carries the AOS attributes is the one that must keep a
    // static class list.
    const panel = wrapper.find("#faq-panel-0").element as HTMLElement
    const aosWrapper = panel.closest("[data-aos]") as HTMLElement | null
    expect(aosWrapper, "the FAQ row should sit inside a [data-aos] wrapper").not.toBeNull()
    if (!aosWrapper) return

    // AOS adds this class imperatively at runtime; Vue knows nothing about it.
    aosWrapper.classList.add("aos-init", "aos-animate")

    await wrapper.findAll("button")[1].trigger("click")
    await wrapper.findAll("button")[0].trigger("click")

    // A dynamic :class on this element would have made Vue rewrite the whole
    // attribute here, dropping `aos-animate` and fading the row out.
    expect(aosWrapper.classList.contains("aos-animate")).toBe(true)
    expect(aosWrapper.classList.contains("aos-init")).toBe(true)
  })

  it("closes the open row when its own trigger is clicked again", async () => {
    const wrapper = mountFaq()
    const trigger = wrapper.findAll("button")[0]

    await trigger.trigger("click")

    expect(trigger.attributes("aria-expanded")).toBe("false")
    expect(wrapper.findAll("[aria-expanded='true']")).toHaveLength(0)
  })
})
