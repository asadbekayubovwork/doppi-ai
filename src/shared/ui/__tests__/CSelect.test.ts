import { afterEach, describe, expect, it } from "vitest"
import { enableAutoUnmount, mount, type VueWrapper } from "@vue/test-utils"
import CSelect from "../CSelect.vue"

enableAutoUnmount(afterEach)

const options = [
  { value: "480p", label: "480p" },
  { value: "720p", label: "720p", disabled: true },
  { value: "1080p", label: "1080p" },
]

const mountSelect = (modelValue = "480p"): VueWrapper =>
  mount(CSelect, {
    props: {
      options,
      label: "Resolution",
      modelValue,
      "onUpdate:modelValue": (value: string | number | undefined) =>
        wrapper.setProps({ modelValue: value }),
    },
    global: { stubs: { teleport: true } },
  })
let wrapper: VueWrapper

describe("CSelect", () => {
  it("shows the selected label and opens a listbox on click", async () => {
    wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    expect(trigger.text()).toContain("480p")
    expect(trigger.attributes("aria-expanded")).toBe("false")

    await trigger.trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("true")
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
  })

  it("skips disabled options with the keyboard and emits change", async () => {
    wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')

    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "Enter" })

    expect(wrapper.emitted("change")?.[0]).toEqual(["1080p"])
    expect(trigger.text()).toContain("1080p")
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it("ignores clicks on disabled options", async () => {
    wrapper = mountSelect()
    await wrapper.get('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[1].trigger("click")

    expect(wrapper.emitted("change")).toBeUndefined()
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
  })

  it("closes on Escape without changing the value", async () => {
    wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("keydown", { key: "Escape" })

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()
  })
})
