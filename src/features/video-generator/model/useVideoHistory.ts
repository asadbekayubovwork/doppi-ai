import type { ComputedRef } from "vue"
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { messageForProblem } from "@/features/auth"
import { useToast } from "@/shared/lib"
import {
  resolveMediaUrl,
  videoApi,
  type VideoListParams,
  type VideoSyncStatus,
} from "../api/videoApi"
import type { VideoJob } from "../api/types"

type IsCurrent = (workspace: string, epoch: number) => boolean

export const useVideoHistory = (
  businessId: ComputedRef<string>,
  getGeneration: () => number,
  isCurrent: IsCurrent
) => {
  const toast = useToast()
  const { t } = useI18n()
  const toastText = (key: string, named: Record<string, unknown> = {}) =>
    t(`dashboard.video.studio.toasts.${key}`, named)
  const jobs = ref<VideoJob[]>([])
  const isLoading = ref(false)
  const isSyncing = ref(false)
  let loadSequence = 0

  const load = async (params: VideoListParams = {}) => {
    const workspace = businessId.value
    const epoch = getGeneration()
    const sequence = ++loadSequence
    if (!workspace) {
      jobs.value = []
      isLoading.value = false
      return
    }
    isLoading.value = true
    try {
      const result = await videoApi.list(workspace, { limit: 100, ...params })
      if (isCurrent(workspace, epoch) && sequence === loadSequence)
        jobs.value = result
    } catch (error) {
      if (!isCurrent(workspace, epoch)) return
      toast.error(
        toastText("loadFailed"),
        messageForProblem(error, t("dashboard.common.tryLater"))
      )
    } finally {
      if (isCurrent(workspace, epoch) && sequence === loadSequence)
        isLoading.value = false
    }
  }

  const sync = async (
    status?: VideoSyncStatus,
    options: { silent?: boolean } = {}
  ) => {
    if (!businessId.value || isSyncing.value) return
    isSyncing.value = true
    const workspace = businessId.value
    const epoch = getGeneration()
    try {
      const result = await videoApi.sync(workspace, status)
      if (!isCurrent(workspace, epoch)) return
      await load()
      if (!isCurrent(workspace, epoch)) return
      if (!options.silent) {
        toast.success(
          toastText("synced"),
          toastText("syncedDetail", {
            imported: result.imported,
            updated: result.updated,
          })
        )
      }
    } catch (error) {
      if (!isCurrent(workspace, epoch)) return
      if (options.silent) await load()
      else {
        toast.error(
          toastText("syncFailed"),
          messageForProblem(error, t("dashboard.common.tryLater"))
        )
      }
    } finally {
      if (isCurrent(workspace, epoch)) isSyncing.value = false
    }
  }

  const reset = () => {
    loadSequence++
    jobs.value = []
    isLoading.value = false
    isSyncing.value = false
  }

  const download = (job: VideoJob) => {
    if (!businessId.value || job.status !== "completed") return
    window.location.assign(
      resolveMediaUrl(
        job.download_url,
        videoApi.downloadUrl(businessId.value, job.id)
      )
    )
  }

  return { jobs, isLoading, isSyncing, load, sync, reset, download }
}
