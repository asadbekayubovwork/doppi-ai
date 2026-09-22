import { apiClient } from "@/shared/api"
import { resolveMediaUrl, videoApi } from "../videoApi"

describe("video backend contracts", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("uses local job endpoints and requires an idempotency key for create", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue([] as never)
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({} as never)
    const payload = {
      brief: {
        topic: "Autumn launch",
        duration_sec: 15,
        aspect_ratio: "9:16" as const,
      },
    }

    await videoApi.list("business-1")
    await videoApi.get("business-1", "job-1")
    await videoApi.create("business-1", payload, "idempotency-key-1")
    await videoApi.refresh("business-1", "job-1")
    await videoApi.sync("business-1")

    expect(get).toHaveBeenNthCalledWith(
      1,
      "/businesses/business-1/video-jobs",
      undefined
    )
    expect(get).toHaveBeenNthCalledWith(
      2,
      "/businesses/business-1/video-jobs/job-1"
    )
    expect(post).toHaveBeenNthCalledWith(
      1,
      "/businesses/business-1/video-jobs",
      payload,
      { headers: { "Idempotency-Key": "idempotency-key-1" } }
    )
    expect(post).toHaveBeenNthCalledWith(
      2,
      "/businesses/business-1/video-jobs/job-1/refresh"
    )
    expect(post).toHaveBeenNthCalledWith(
      3,
      "/businesses/business-1/video-jobs/sync/upstream",
      undefined,
      undefined
    )
  })

  it("passes list filters and sync status as query params", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue([] as never)
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({} as never)

    await videoApi.list("business-1", { status: "completed", limit: 50 })
    await videoApi.sync("business-1", "processing")

    expect(get).toHaveBeenCalledWith("/businesses/business-1/video-jobs", {
      params: { status: "completed", limit: 50 },
    })
    expect(post).toHaveBeenCalledWith(
      "/businesses/business-1/video-jobs/sync/upstream",
      undefined,
      { params: { status: "processing" } }
    )
  })

  it("builds a same-origin secure download URL", () => {
    expect(videoApi.downloadUrl("business-1", "job-1")).toBe(
      "/api/v1/businesses/business-1/video-jobs/job-1/download"
    )
    expect(videoApi.streamUrl("business-1", "job-1")).toBe(
      "/api/v1/businesses/business-1/video-jobs/job-1/stream"
    )
  })

  it("does not let provider URLs bypass the control plane", () => {
    const fallback = videoApi.streamUrl("business-1", "job-1")
    expect(
      resolveMediaUrl("https://provider.example/video.mp4", fallback)
    ).toBe(fallback)
    expect(resolveMediaUrl(fallback, "/fallback")).toBe(fallback)
  })
})
