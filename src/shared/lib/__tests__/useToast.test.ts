import { beforeEach, describe, expect, it, vi } from "vitest"

import { useToast } from "../composables/useToast"

const { sonner } = vi.hoisted(() => ({
  sonner: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(() => 1),
    dismiss: vi.fn(),
  },
}))

vi.mock("vue-sonner", () => ({ toast: sonner }))

describe("shared/lib/composables/useToast", () => {
  beforeEach(() => {
    Object.values(sonner).forEach((spy) => spy.mockClear())
  })

  it("success() forwards to the renderer with the 3000ms default duration", () => {
    useToast().success("Profil saqlandi")

    expect(sonner.success).toHaveBeenCalledWith("Profil saqlandi", {
      description: undefined,
      duration: 3000,
    })
  })

  it("error() defaults to 4000ms duration (longer for errors)", () => {
    useToast().error("Kirish amalga oshmadi")

    expect(sonner.error).toHaveBeenCalledWith("Kirish amalga oshmadi", {
      description: undefined,
      duration: 4000,
    })
  })

  it("warning() and info() default to 3000ms duration", () => {
    useToast().warning("Shartlarni qabul qiling")
    useToast().info("Yangi kod yuborildi")

    expect(sonner.warning).toHaveBeenCalledWith("Shartlarni qabul qiling", {
      description: undefined,
      duration: 3000,
    })
    expect(sonner.info).toHaveBeenCalledWith("Yangi kod yuborildi", {
      description: undefined,
      duration: 3000,
    })
  })

  it("passes content and a custom duration through", () => {
    useToast().success("Taklif yaratildi", "hamkasb@kompaniya.uz", 7000)

    expect(sonner.success).toHaveBeenCalledWith("Taklif yaratildi", {
      description: "hamkasb@kompaniya.uz",
      duration: 7000,
    })
  })

  it("loading() stays until it is dismissed by id", () => {
    const id = useToast().loading("Telegram tasdiqlanmoqda...")

    expect(sonner.loading).toHaveBeenCalledWith("Telegram tasdiqlanmoqda...", {
      description: undefined,
      duration: Infinity,
    })

    useToast().dismiss(id)
    expect(sonner.dismiss).toHaveBeenCalledWith(1)
  })
})
