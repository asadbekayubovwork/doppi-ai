import { computed, reactive, ref } from "vue"
import { videoApi } from "../../api/videoApi"
import type { VideoModelCatalog } from "../../api/types"
import { useVideoModelCatalog } from "../useVideoModelCatalog"

const catalog: VideoModelCatalog = {
  provider: "magic_hour",
  default_model: "model-a",
  models: [
    {
      model: "model-a",
      name: "Model A",
      resolutions: ["720p", "1080p"],
      durations_seconds: [5, 10],
      supports_audio: true,
      cost_per_second_usd: 0.04,
      is_default: true,
    },
  ],
}

describe("useVideoModelCatalog", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("loads live model options and replaces an unsupported duration", async () => {
    vi.spyOn(videoApi, "models").mockResolvedValue(catalog)
    const businessId = ref("business-1")
    const selection = reactive({
      videoModel: "",
      videoResolution: "",
      durationSec: 30,
    })
    const controller = useVideoModelCatalog(
      computed(() => businessId.value),
      selection,
      () => 1,
      (workspace, epoch) => workspace === businessId.value && epoch === 1
    )

    await controller.load()

    expect(controller.modelCatalog.value?.default_model).toBe("model-a")
    expect(selection).toMatchObject({
      videoModel: "model-a",
      videoResolution: "720p",
      durationSec: 5,
    })
  })

  it("discards a catalog response after the active workspace changes", async () => {
    let resolveOld!: (value: VideoModelCatalog) => void
    const oldResponse = new Promise<VideoModelCatalog>((resolve) => {
      resolveOld = resolve
    })
    vi.spyOn(videoApi, "models")
      .mockReturnValueOnce(oldResponse)
      .mockResolvedValueOnce(catalog)
    const businessId = ref("business-1")
    const selection = reactive({
      videoModel: "",
      videoResolution: "",
      durationSec: 5,
    })
    const controller = useVideoModelCatalog(
      computed(() => businessId.value),
      selection,
      () => 1,
      (workspace, epoch) => workspace === businessId.value && epoch === 1
    )

    const staleLoad = controller.load()
    businessId.value = "business-2"
    controller.reset()
    await controller.load()
    resolveOld(catalog)
    await staleLoad

    expect(selection.videoModel).toBe("model-a")
    expect(controller.modelCatalog.value?.default_model).toBe("model-a")
  })
})
