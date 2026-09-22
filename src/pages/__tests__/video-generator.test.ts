import { createHead } from "@unhead/vue/client"
import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { useAuthStore } from "@/features/auth"
import {
  videoApi,
  type VideoJob,
  type VideoModelCatalog,
} from "@/features/video-generator"
import PVideoStudio from "../PVideoStudio.vue"

const modelCatalog: VideoModelCatalog = {
  provider: "magic_hour",
  default_model: "model-a",
  models: [
    {
      model: "model-a",
      name: "Model A",
      resolutions: ["720p", "1080p"],
      durations_seconds: [5, 10, 15],
      supports_audio: true,
      cost_per_second_usd: 0.04,
      is_default: true,
    },
    {
      model: "model-b",
      name: "Model B",
      resolutions: ["480p"],
      durations_seconds: [8, 12],
      supports_audio: false,
      cost_per_second_usd: null,
      is_default: false,
    },
  ],
}

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
  const wrapper = mount(PVideoStudio, {
    global: {
      plugins: [pinia, createHead()],
      stubs: { RouterLink: true, teleport: true },
    },
  })
  await flushPromises()
  return wrapper
}

describe("video studio integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(videoApi, "list").mockResolvedValue([])
    vi.spyOn(videoApi, "models").mockResolvedValue(modelCatalog)
  })

  it("loads only local history on mount and keeps generation explicit", async () => {
    const create = vi.spyOn(videoApi, "create").mockResolvedValue(job)
    vi.spyOn(window, "confirm").mockReturnValue(false)
    const wrapper = await mountPage()

    expect(videoApi.list).toHaveBeenCalledWith("business-1", {})
    expect(wrapper.text()).toContain("Yangi video yaratish")
    expect(wrapper.text()).toContain("Prompt va kontekst")
    expect(wrapper.text()).toContain("Generation jobs")

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
          video_provider: "magic_hour",
          video_model: "model-a",
          video_resolution: "720p",
          subtitles: true,
          preview_only: false,
          research_mode: "fast",
        }),
      },
      expect.any(String)
    )
    wrapper.unmount()
  })

  it("offers model-specific resolutions from the catalog", async () => {
    const wrapper = await mountPage()
    const model = wrapper.find('select[aria-label="Video model"]')
    const resolution = wrapper.find('select[aria-label="Resolution"]')
    const duration = wrapper.find('select[aria-label="Duration"]')

    expect(model.exists()).toBe(true)
    await model.setValue("model-b")
    await flushPromises()

    expect(resolution.element.value).toBe("480p")
    expect(duration.element.value).toBe("8")
    expect(wrapper.text()).toContain("Model B")
    wrapper.unmount()
  })

  it("shows real job history instead of studio fixture videos", async () => {
    vi.mocked(videoApi.list).mockResolvedValue([
      {
        ...job,
        status: "completed",
        brief: { ...job.brief, topic: "Live result" },
        stream_url: "/api/v1/businesses/business-1/video-jobs/job-1/stream",
        download_url: "/api/v1/businesses/business-1/video-jobs/job-1/download",
      },
    ])
    const wrapper = await mountPage()
    const library = wrapper
      .findAll("section")
      .find((section) => section.text().includes("Mening videolarim"))

    expect(library?.text()).toContain("Live result")
    expect(library?.text()).not.toContain("Barista tanlovi teaser")
    expect(
      library?.find('a[aria-label="Videoni ko\'rish"]').attributes("href")
    ).toContain("/video-jobs/job-1/stream")
    expect(
      library?.find('a[aria-label="Videoni yuklab olish"]').attributes("href")
    ).toContain("/video-jobs/job-1/download")
    wrapper.unmount()
  })
})
