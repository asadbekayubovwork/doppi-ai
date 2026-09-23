import { mount } from "@vue/test-utils"
import CVideoPreviewDialog from "../CVideoPreviewDialog.vue"
import type { VideoJob } from "../../api/types"

const job: VideoJob = {
  id: "job-1",
  business_id: "business-1",
  external_job_id: "provider-1",
  job_type: "video",
  status: "completed",
  brief: {
    topic: "Bahor kolleksiyasi",
    aspect_ratio: "9:16",
    duration_sec: 15,
  },
  publish_to: null,
  result_url: null,
  stream_url: "/api/v1/businesses/business-1/video-jobs/job-1/stream",
  download_url: "/api/v1/businesses/business-1/video-jobs/job-1/download",
  error_message: null,
  detail: null,
  created_at: "2026-09-23T10:00:00Z",
  updated_at: "2026-09-23T10:00:00Z",
  started_at: "2026-09-23T10:00:01Z",
  completed_at: "2026-09-23T10:01:00Z",
}

describe("CVideoPreviewDialog", () => {
  it("shows the clip in the app and exposes a download action", async () => {
    const wrapper = mount(CVideoPreviewDialog, {
      props: { job },
      global: {
        stubs: {
          Teleport: true,
          CIcon: true,
          CVideoPlayer: { props: ["src"], template: "<video :src='src' />" },
        },
      },
    })

    expect(wrapper.get('[role="dialog"]').attributes("aria-modal")).toBe("true")
    expect(wrapper.text()).toContain("Bahor kolleksiyasi")
    expect(wrapper.get("video").attributes("src")).toBe(job.stream_url)
    expect(wrapper.text()).not.toContain("API")

    await wrapper.get('[role="dialog"]').trigger("keydown", { key: "Escape" })
    expect(wrapper.emitted("close")).toHaveLength(1)
    const download = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Videoni yuklab olish"))
    await download?.trigger("click")
    expect(wrapper.emitted("download")?.[0]?.[0]).toEqual(job)
    wrapper.unmount()
  })
})
