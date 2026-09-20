import { apiClient } from "@/shared/api"
import { apiUrl } from "@/shared/config/api"
import type {
  VideoJob,
  VideoJobCreatePayload,
  VideoJobStatus,
  VideoSyncResult,
} from "./types"

const root = (businessId: string) => `/businesses/${businessId}/video-jobs`

/** Filters the job list endpoint accepts (see OpenAPI: GET video-jobs). */
export interface VideoListParams {
  status?: VideoJobStatus
  /** 1–100, backend default 20. */
  limit?: number
}

/** Statuses the upstream sync endpoint can be narrowed to. */
export type VideoSyncStatus = Extract<
  VideoJobStatus,
  "queued" | "processing" | "completed" | "failed"
>

// Drops undefined entries so the query string only carries set filters.
const query = (input: Record<string, string | number | undefined>) => {
  const params: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) params[key] = value
  }
  return Object.keys(params).length ? { params } : undefined
}

// VideoListParams has no index signature, so spread it into a plain record.
const listQuery = (params: VideoListParams) =>
  query({ status: params.status, limit: params.limit })

export const videoApi = {
  list: (businessId: string, params: VideoListParams = {}) =>
    apiClient.get<VideoJob[]>(root(businessId), listQuery(params)),
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
  sync: (businessId: string, status?: VideoSyncStatus) =>
    apiClient.post<VideoSyncResult>(
      `${root(businessId)}/sync/upstream`,
      undefined,
      query({ status })
    ),
  downloadUrl: (businessId: string, jobId: string) =>
    apiUrl(`${root(businessId)}/${jobId}/download`),
}
