import { computed, ref, type ComputedRef } from "vue"
import { messageForProblem } from "@/features/auth"
import { videoApi } from "../api/videoApi"
import type { VideoModel, VideoModelCatalog } from "../api/types"

interface VideoModelSelection {
  videoModel: string
  videoResolution: string
  durationSec: number
}

export const useVideoModelCatalog = (
  businessId: ComputedRef<string>,
  selection: VideoModelSelection,
  getGeneration: () => number,
  isCurrent: (workspace: string, epoch: number) => boolean
) => {
  const modelCatalog = ref<VideoModelCatalog | null>(null)
  /**
   * Set when the catalog failed to load: the server's explanation, or "" for
   * the UI to show its own translated message.
   */
  const modelError = ref<string | null>(null)
  const isLoadingModels = ref(false)
  let loadSequence = 0

  const selectedModel = computed<VideoModel | null>(
    () =>
      modelCatalog.value?.models.find(
        (item) => item.model === selection.videoModel
      ) ?? null
  )

  const invalidate = () => {
    loadSequence++
  }

  const reset = () => {
    invalidate()
    modelCatalog.value = null
    modelError.value = null
    isLoadingModels.value = false
    selection.videoModel = ""
    selection.videoResolution = ""
  }

  const load = async () => {
    const workspace = businessId.value
    const epoch = getGeneration()
    const sequence = ++loadSequence
    if (!workspace) {
      reset()
      return
    }
    isLoadingModels.value = true
    modelError.value = null
    try {
      const result = await videoApi.models(workspace)
      if (!isCurrent(workspace, epoch) || sequence !== loadSequence) return
      modelCatalog.value = result
      const preferred =
        result.models.find((item) => item.model === selection.videoModel) ??
        result.models.find((item) => item.model === result.default_model) ??
        result.models.find((item) => item.is_default) ??
        result.models[0]
      selection.videoModel = preferred?.model ?? ""
      selection.videoResolution = preferred?.resolutions[0] ?? ""
      if (
        preferred?.durations_seconds.length &&
        !preferred.durations_seconds.includes(selection.durationSec)
      ) {
        selection.durationSec = preferred.durations_seconds[0]
      }
    } catch (error) {
      if (!isCurrent(workspace, epoch) || sequence !== loadSequence) return
      modelCatalog.value = null
      modelError.value = messageForProblem(error, "")
      selection.videoModel = ""
      selection.videoResolution = ""
    } finally {
      if (isCurrent(workspace, epoch) && sequence === loadSequence)
        isLoadingModels.value = false
    }
  }

  return {
    modelCatalog,
    modelError,
    isLoadingModels,
    selectedModel,
    load,
    reset,
    invalidate,
  }
}
