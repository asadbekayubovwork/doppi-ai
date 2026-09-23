import { mount } from "@vue/test-utils"
import CVideoPlayer from "../CVideoPlayer.vue"

describe("CVideoPlayer", () => {
  it("shows a loading state until the video can display a frame", async () => {
    const wrapper = mount(CVideoPlayer, {
      props: { src: "/video.mp4" },
      global: { stubs: { CIcon: true } },
    })

    expect(wrapper.get('[role="status"]').text()).toContain("Video yuklanmoqda")
    await wrapper.get("video").trigger("loadeddata")
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.get("video").attributes("src")).toBe("/video.mp4")
  })

  it("shows a clear retry action when playback fails", async () => {
    const wrapper = mount(CVideoPlayer, {
      props: { src: "/video.mp4" },
      global: { stubs: { CIcon: true } },
    })

    await wrapper.get("video").trigger("error")
    expect(wrapper.find("video").exists()).toBe(false)
    expect(wrapper.text()).toContain("Video hozir ochilmadi")

    await wrapper.get("button").trigger("click")
    expect(wrapper.find("video").exists()).toBe(true)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })
})
