import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import CTelegramLogin from "../CTelegramLogin.vue"

describe("official Telegram login widget", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("renders no placeholder and emits no Vue warning while Telegram auth is disabled", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {})
    const wrapper = mount(CTelegramLogin)

    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.find("script").exists()).toBe(false)
    expect(warning).not.toHaveBeenCalled()

    warning.mockRestore()
    wrapper.unmount()
  })

  it("loads Telegram's signed callback widget when configured", () => {
    vi.stubEnv("VITE_TELEGRAM_AUTH_ENABLED", "true")
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
