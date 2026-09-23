import { createHead } from "@unhead/vue/client"
import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { useAuthStore } from "@/features/auth"
import {
  CVideoPreviewDialog,
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

  it("hydrates provider history on mount without starting a generation", async () => {
    const create = vi.spyOn(videoApi, "create").mockResolvedValue(job)
    const wrapper = await mountPage()

    expect(videoApi.list).toHaveBeenCalledWith("business-1", { limit: 100 })
    expect(wrapper.text()).toContain("Yangi video yaratish")
    expect(wrapper.text()).toContain("Prompt va kontekst")
    expect(wrapper.text()).toContain("Yaratilgan videolar")

    expect(create).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it("submits the documented brief without a confirmation prompt", async () => {
    const create = vi.spyOn(videoApi, "create").mockResolvedValue(job)
    const confirm = vi.spyOn(window, "confirm")
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
    expect(confirm).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it("offers model-specific resolutions from the catalog", async () => {
    const wrapper = await mountPage()
    const model = wrapper.find('[role="combobox"][aria-label="Video model"]')

    expect(model.exists()).toBe(true)
    await model.trigger("click")
    const option = wrapper
      .findAll('[role="option"]')
      .find((el) => el.text().includes("Model B"))
    await option?.trigger("click")
    await flushPromises()

    expect(
      wrapper.find('[role="combobox"][aria-label="Resolution"]').text()
    ).toContain("480p")
    expect(
      wrapper.find('[role="combobox"][aria-label="Duration"]').text()
    ).toContain("8s")
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
    expect(library?.find("video").attributes("src")).toContain(
      "/video-jobs/job-1/stream"
    )
    expect(
      library?.find('button[aria-label="Videoni ko\'rish"]').exists()
    ).toBe(true)
    expect(
      library?.find('a[aria-label="Videoni yuklab olish"]').attributes("href")
    ).toContain("/video-jobs/job-1/download")
    wrapper.unmount()
  })

  it("plays a history item inside the studio instead of opening a blank tab", async () => {
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
    const library = wrapper.findComponent({ name: "CStudioLibrary" })

    await library.find('button[aria-label="Videoni ko\'rish"]').trigger("click")

    expect(
      wrapper.findComponent(CVideoPreviewDialog).props("job")
    ).toMatchObject({
      id: "job-1",
      brief: { topic: "Live result" },
    })
    wrapper.unmount()
  })
})
