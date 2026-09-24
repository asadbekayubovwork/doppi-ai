import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest"
import { mount, enableAutoUnmount } from "@vue/test-utils"
import { nextTick } from "vue"
import { createI18n } from "vue-i18n"
import { createRouter, createWebHistory } from "vue-router"
import { messages } from "@/shared/config/i18n"
import CVideoShowcase from "../ui/CVideoShowcase.vue"
import { SHOWCASE_COLUMNS } from "../model/columns"

const mountShowcase = (locale = "uz") => {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: "en",
    messages,
    globalInjection: true,
  })

  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
  })

  return mount(CVideoShowcase as never, { global: { plugins: [i18n, router] } })
}

enableAutoUnmount(afterEach)

describe("CVideoShowcase", () => {
  it("shows every clip from public/videos, muted and looping", () => {
    const videos = mountShowcase().findAll("video")
    const files = SHOWCASE_COLUMNS.flat().map((tile) => tile.file)

    expect(videos.map((v) => v.attributes("src"))).toEqual(files.map((f) => `/videos/${f}`))
    for (const file of files) {
      expect(existsSync(resolve(__dirname, "../../../../public/videos", file)), file).toBe(true)
    }
    for (const video of videos) {
      const el = video.element as HTMLVideoElement
      expect(el.muted && el.loop).toBe(true)
      expect(video.attributes("preload")).toBe("none")
    }
  })

  it("renders the copy, tags and links", () => {
    const wrapper = mountShowcase()
    const hrefs = wrapper.findAll("a").map((a) => a.attributes("href"))

    expect(wrapper.find("h2").text()).toBe("Doppi Video Studio")
    expect(wrapper.text()).toContain("Barcha namunalarni ko'rish")
    expect(wrapper.text()).toContain("Mahsulot videosi")
    expect(hrefs).toEqual(["/login", "/video-generator", "/video-generator"])
  })

  it.each(["uz", "en", "ru"])("%s resolves every label", (locale) => {
    expect(mountShowcase(locale).text()).not.toMatch(/studio\./)
  })

  describe("playback", () => {
    let report: (visible: boolean) => void

    beforeEach(() => {
      vi.stubGlobal(
        "IntersectionObserver",
        class {
          constructor(callback: IntersectionObserverCallback) {
            report = (isIntersecting) =>
              callback([{ isIntersecting } as IntersectionObserverEntry], this as never)
          }
          observe() {}
          disconnect() {}
        }
      )
      // jsdom does no layout, so every element would read as hidden.
      vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockReturnValue(document.body)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    it("plays the clips while the wall is on screen and pauses them after", async () => {
      const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue()
      const pause = vi
        .spyOn(HTMLMediaElement.prototype, "pause")
        .mockImplementation(() => {})
      vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockReturnValue(false)
      const clips = SHOWCASE_COLUMNS.flat().length

      mountShowcase()
      expect(play).not.toHaveBeenCalled()

      report(true)
      await nextTick()
      expect(play).toHaveBeenCalledTimes(clips)

      report(false)
      await nextTick()
      expect(pause).toHaveBeenCalledTimes(clips)
    })
  })
})
