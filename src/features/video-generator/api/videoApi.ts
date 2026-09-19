import { apiClient } from "@/shared/api"
import { apiUrl } from "@/shared/config/api"
import type { VideoJob, VideoJobCreatePayload, VideoSyncResult } from "./types"

const root = (businessId: string) => `/businesses/${businessId}/video-jobs`

export const videoApi = {
  list: (businessId: string) => apiClient.get<VideoJob[]>(root(businessId)),
  get: (businessId: string, jobId: string) =>
    apiClient.get<VideoJob>(`${root(businessId)}/${jobId}`),
  create: (
    businessId: string,
    payload: VideoJobCreatePayload,
    idempotencyKey: string
  ) =>
    apiClient.post<VideoJob>(root(businessId), payload, {
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  refresh: (businessId: string, jobId: string) =>
    apiClient.post<VideoJob>(`${root(businessId)}/${jobId}/refresh`),
  sync: (businessId: string) =>
    apiClient.post<VideoSyncResult>(`${root(businessId)}/sync/upstream`),
  downloadUrl: (businessId: string, jobId: string) =>
    apiUrl(`${root(businessId)}/${jobId}/download`),
}
