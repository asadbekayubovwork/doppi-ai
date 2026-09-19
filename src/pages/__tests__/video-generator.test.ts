import { createHead } from "@unhead/vue/client"
import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { useAuthStore } from "@/features/auth"
import { videoApi, type VideoJob } from "@/features/video-generator"
import PVideoGenerator from "../PVideoGenerator.vue"

const job: VideoJob = {
  id: "job-1",
  business_id: "business-1",
  external_job_id: "external-1",
  job_type: "video",
  status: "queued",
  brief: {
    topic: "Autumn launch",
    duration_sec: 15,
    language: "uz",
    aspect_ratio: "9:16",
  },
  publish_to: null,
  result_url: null,
  error_message: null,
  detail: null,
  created_at: "2026-09-19T10:00:00Z",
  updated_at: "2026-09-19T10:00:00Z",
  started_at: null,
  completed_at: null,
}

const mountPage = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.status = "authenticated"
  auth.businesses = [
    {
      id: "business-1",
      name: "Aura",
      slug: "aura",
      status: "active",
      default_language: "uz",
      billing_region: "UZ",
    },
  ]
  auth.activeBusinessId = "business-1"
  const wrapper = mount(PVideoGenerator, {
    global: { plugins: [pinia, createHead()] },
  })
  await flushPromises()
  return wrapper
}

describe("video generator integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(videoApi, "list").mockResolvedValue([])
  })

  it("keeps generation explicit and loads only local history on mount", async () => {
    const create = vi.spyOn(videoApi, "create").mockResolvedValue(job)
    vi.spyOn(window, "confirm").mockReturnValue(false)
    const wrapper = await mountPage()

    expect(videoApi.list).toHaveBeenCalledWith("business-1")
    expect(wrapper.text()).toContain("New video")
    expect(wrapper.text()).toContain("No video jobs yet")

    await wrapper.find("textarea").setValue("Autumn launch")
    await wrapper.find("form").trigger("submit")
    await flushPromises()

    expect(window.confirm).toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it("submits the documented brief after confirmation", async () => {
    const create = vi.spyOn(videoApi, "create").mockResolvedValue(job)
    vi.spyOn(window, "confirm").mockReturnValue(true)
    const wrapper = await mountPage()

    await wrapper.find("textarea").setValue("Autumn launch")
    await wrapper.find("form").trigger("submit")
    await flushPromises()

    expect(create).toHaveBeenCalledWith(
      "business-1",
      {
        brief: expect.objectContaining({
          topic: "Autumn launch",
          duration_sec: 15,
          language: "uz",
          aspect_ratio: "9:16",
          subtitles: true,
          preview_only: false,
          research_mode: "fast",
        }),
      },
      expect.any(String)
    )
    expect(wrapper.text()).toContain("Autumn launch")
    wrapper.unmount()
  })
})
