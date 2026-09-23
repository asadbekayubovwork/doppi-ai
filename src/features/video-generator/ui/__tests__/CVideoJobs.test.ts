import { mount } from "@vue/test-utils"
import CVideoJobs from "../CVideoJobs.vue"
import type { VideoJob } from "../../api/types"

const job: VideoJob = {
  id: "job-1",
  business_id: "business-1",
  external_job_id: "provider-1",
  job_type: "video",
  status: "completed",
  brief: { topic: "Launch video" },
  publish_to: null,
  result_url: "https://provider.example/video.mp4",
  stream_url: "/api/v1/businesses/business-1/video-jobs/job-1/stream",
  download_url: "/api/v1/businesses/business-1/video-jobs/job-1/download",
  error_message: null,
  detail: null,
  created_at: "2026-09-19T10:00:00Z",
  updated_at: "2026-09-19T10:00:00Z",
  started_at: "2026-09-19T10:00:01Z",
  completed_at: "2026-09-19T10:01:00Z",
}

describe("CVideoJobs", () => {
  it("opens the selected completed job in the frontend player", async () => {
    const wrapper = mount(CVideoJobs, {
      props: { jobs: [job], isLoading: false, isSyncing: false },
      global: {
        stubs: {
          CAppButton: { template: "<button><slot /></button>" },
          CBadge: { template: "<span><slot /></span>" },
          CEmptyState: true,
          CIcon: true,
          CSkeleton: true,
        },
      },
    })

    expect(wrapper.text()).not.toContain(job.stream_url)
    expect(wrapper.text()).toContain("Ko‘rish")
    await wrapper
      .find('button[aria-label="Videoni ilovada ko\'rish"]')
      .trigger("click")
    expect(wrapper.emitted("preview")?.[0]?.[0]).toEqual(job)
  })
})
