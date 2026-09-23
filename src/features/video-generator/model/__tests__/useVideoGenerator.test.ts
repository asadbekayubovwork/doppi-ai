import { defineComponent } from "vue"
import { createPinia, setActivePinia } from "pinia"
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { useAuthStore } from "@/features/auth"
import { videoApi } from "../../api/videoApi"
import type { VideoJob, VideoModelCatalog } from "../../api/types"
import { useVideoGenerator } from "../useVideoGenerator"

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

const makeJob = (overrides: Partial<VideoJob> = {}): VideoJob => ({
  id: "job-1",
  business_id: "business-1",
  external_job_id: "external-1",
  job_type: "video",
  status: "queued",
  brief: { topic: "Test" },
  publish_to: null,
  result_url: null,
  error_message: null,
  detail: null,
  created_at: "2026-09-19T10:00:00Z",
  updated_at: "2026-09-19T10:00:00Z",
  started_at: null,
  completed_at: null,
  ...overrides,
})

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

let wrapper: VueWrapper
let video: ReturnType<typeof useVideoGenerator>
let auth: ReturnType<typeof useAuthStore>

const mountController = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  auth = useAuthStore()
  auth.businesses = ["business-1", "business-2"].map((id) => ({
    id,
    name: id,
    slug: id,
    status: "active",
    default_language: "uz",
    billing_region: "UZ",
  }))
  auth.activeBusinessId = "business-1"
  wrapper = mount(
    defineComponent({
      setup() {
        video = useVideoGenerator()
        return () => null
      },
    }),
    { global: { plugins: [pinia] } }
  )
  await flushPromises()
}

describe("video async isolation and submission safety", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] })
    vi.spyOn(videoApi, "list").mockResolvedValue([])
    vi.spyOn(videoApi, "sync").mockResolvedValue({
      examined: 0,
      imported: 0,
      updated: 0,
    })
    vi.spyOn(videoApi, "models").mockResolvedValue(modelCatalog)
  })
  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("reuses the request key after an interrupted submit", async () => {
    const create = vi
      .spyOn(videoApi, "create")
      .mockRejectedValueOnce(new TypeError("Network interrupted"))
      .mockResolvedValueOnce(makeJob())
    await mountController()
    video.form.topic = "Test"
    await video.create()
    await video.create()
    expect(create).toHaveBeenCalledTimes(2)
    expect(create.mock.calls[0][2]).toBe(create.mock.calls[1][2])
    expect(create.mock.calls[0][1].brief).toMatchObject({
      video_provider: "magic_hour",
      video_model: "model-a",
      video_resolution: "720p",
    })
    expect(video.jobs.value).toHaveLength(1)
  })

  it("loads model and resolution defaults from the live catalog", async () => {
    await mountController()

    expect(videoApi.models).toHaveBeenCalledWith("business-1")
    expect(videoApi.sync).toHaveBeenCalledWith("business-1", undefined)
    expect(video.form.videoModel).toBe("model-a")
    expect(video.form.videoResolution).toBe("720p")
    expect(video.modelCatalog.value?.models).toHaveLength(2)
  })

  it("synchronizes provider history when the active workspace changes", async () => {
    await mountController()

    auth.activeBusinessId = "business-2"
    await flushPromises()

    expect(videoApi.sync).toHaveBeenNthCalledWith(1, "business-1", undefined)
    expect(videoApi.sync).toHaveBeenNthCalledWith(2, "business-2", undefined)
  })

  it("does not poll or resubmit uncertain upstream submissions", async () => {
    const create = vi.spyOn(videoApi, "create").mockResolvedValue(
      makeJob({
        status: "submission_unknown",
        external_job_id: null,
      })
    )
    const refresh = vi.spyOn(videoApi, "refresh")
    await mountController()
    video.form.topic = "Test"
    await video.create()
    await vi.advanceTimersByTimeAsync(15_000)
    await video.create()
    expect(create.mock.calls[0][2]).toBe(create.mock.calls[1][2])
    expect(refresh).not.toHaveBeenCalled()
    expect(video.form.topic).toBe("Test")
  })

  it("allows a new attempt after a definite failure", async () => {
    const create = vi
      .spyOn(videoApi, "create")
      .mockResolvedValueOnce(makeJob({ status: "submission_failed" }))
      .mockResolvedValueOnce(makeJob())
    await mountController()
    video.form.topic = "Test"
    await video.create()
    await video.create()
    expect(create).toHaveBeenCalledTimes(2)
    expect(create.mock.calls[0][2]).not.toBe(create.mock.calls[1][2])
  })

  it("discards an old workspace history response", async () => {
    const old = deferred<VideoJob[]>()
    vi.mocked(videoApi.list)
      .mockReturnValueOnce(old.promise)
      .mockResolvedValue([])
    await mountController()
    auth.activeBusinessId = "business-2"
    await flushPromises()
    old.resolve([makeJob()])
    await flushPromises()
    expect(video.jobs.value).toEqual([])
    expect(video.isLoading.value).toBe(false)
  })

  it("does not erase another workspace draft when creation finishes", async () => {
    const old = deferred<VideoJob>()
    vi.spyOn(videoApi, "create").mockReturnValue(old.promise)
    await mountController()
    video.form.topic = "Old draft"
    const pending = video.create()
    auth.activeBusinessId = "business-2"
    await flushPromises()
    video.form.topic = "New workspace draft"
    old.resolve(makeJob())
    await pending
    expect(video.jobs.value).toEqual([])
    expect(video.form.topic).toBe("New workspace draft")
  })

  it("applies successful polls even when another job fails", async () => {
    vi.mocked(videoApi.list).mockResolvedValue([
      makeJob(),
      makeJob({ id: "job-2" }),
    ])
    vi.spyOn(videoApi, "refresh")
      .mockRejectedValueOnce(new Error("unavailable"))
      .mockResolvedValueOnce(makeJob({ id: "job-2", status: "completed" }))
    await mountController()
    await vi.advanceTimersByTimeAsync(5_000)
    await flushPromises()
    expect(video.jobs.value[1].status).toBe("completed")
  })

  it("reloads local submitting jobs without generating again", async () => {
    vi.mocked(videoApi.list).mockResolvedValue([
      makeJob({ status: "submitting", external_job_id: null }),
    ])
    const get = vi.spyOn(videoApi, "get").mockResolvedValue(makeJob())
    const refresh = vi.spyOn(videoApi, "refresh")
    await mountController()
    await vi.advanceTimersByTimeAsync(5_000)
    expect(get).toHaveBeenCalledWith("business-1", "job-1")
    expect(refresh).not.toHaveBeenCalled()
    expect(video.jobs.value[0].status).toBe("queued")
  })

  it("uses the backend media URL for playback instead of the provider URL", async () => {
    const streamUrl = "/api/v1/businesses/business-1/video-jobs/job-1/stream"
    vi.mocked(videoApi.list).mockResolvedValue([
      makeJob({
        status: "completed",
        result_url: "https://provider.example/video.mp4",
        stream_url: streamUrl,
      }),
    ])
    await mountController()

    expect(video.playbackUrl(video.jobs.value[0])).toBe(streamUrl)
  })

  it("ignores responses after leaving the page", async () => {
    const old = deferred<VideoJob[]>()
    vi.mocked(videoApi.list).mockReturnValue(old.promise)
    await mountController()
    wrapper.unmount()
    old.resolve([makeJob()])
    await flushPromises()
    expect(video.jobs.value).toEqual([])
  })
})
