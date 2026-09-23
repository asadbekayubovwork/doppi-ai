import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import CVideoFrameThumb from "../CVideoFrameThumb.vue"

describe("video history thumbnail", () => {
  it("shows a frame from the authenticated stream when seeking succeeds", async () => {
    const wrapper = mount(CVideoFrameThumb, {
      props: { src: "/api/v1/businesses/b/video-jobs/j/stream" },
    })
    await nextTick()
    const video = wrapper.get("video")

    expect(video.attributes("src")).toContain("/video-jobs/j/stream")
    expect(video.classes()).toContain("opacity-0")
    await video.trigger("loadedmetadata")
    await video.trigger("seeked")
    expect(video.classes()).toContain("opacity-100")
    wrapper.unmount()
  })

  it("keeps the placeholder when the video cannot be loaded", async () => {
    const wrapper = mount(CVideoFrameThumb, { props: { src: "/video.mp4" } })
    await nextTick()
    await wrapper.get("video").trigger("error")
    expect(wrapper.find("video").exists()).toBe(false)
    expect(wrapper.findComponent({ name: "CVideoThumb" }).exists()).toBe(true)
    wrapper.unmount()
  })
})
