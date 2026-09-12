import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import CTelegramLogin from "../CTelegramLogin.vue"

describe("official Telegram login widget", () => {
  it("shows an honest unavailable state when no public bot is configured", () => {
    const wrapper = mount(CTelegramLogin)

    expect(wrapper.get('[role="status"]').text()).toContain("mavjud emas")
    expect(wrapper.find("script").exists()).toBe(false)
  })

  it("loads Telegram's signed callback widget when configured", () => {
    const wrapper = mount(CTelegramLogin, {
      props: { botUsername: "doppi_public_bot" },
    })
    const script = wrapper.get("script").element as HTMLScriptElement

    expect(script.src).toContain("https://telegram.org/js/telegram-widget.js")
    expect(script.dataset.telegramLogin).toBe("doppi_public_bot")
    expect(script.dataset.onauth).toContain("doppiTelegramAuth")
    expect(script.dataset.requestAccess).toBe("write")
  })
})
