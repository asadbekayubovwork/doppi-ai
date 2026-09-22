export type VideoJobStatus =
  | "submitting"
  | "submission_failed"
  | "submission_unknown"
  | "queued"
  | "processing"
  | "completed"
  | "failed"

export interface VideoBrief {
  topic: string
  tone?: string
  duration_sec?: number
  language?: string
  brand_style_id?: string
  aspect_ratio?: "9:16" | "16:9" | "1:1"
  preferred_image_provider?: string
  format?: string
  length?: "short" | "medium" | "long"
  video_provider?: string
  cta?: string
  preview_only?: boolean
  subtitles?: boolean
  source_text?: string
  voice_id?: string
  preferred_tts_provider?: string
  source_video_url?: string
  reference_image_urls?: string[]
  reference_video_url?: string
  reference_links?: string[]
  reference_music_url?: string
  reference_audio_url?: string
  avatar_provider?: string
  skip_research?: boolean
  research_mode?: "fast" | "deep"
  pregenerated_script?: {
    narration: string
    shots: Array<{ prompt: string; image_url?: string }>
  }
}

export interface VideoJob {
  id: string
  business_id: string
  external_job_id: string | null
  job_type: string
  status: VideoJobStatus
  brief: VideoBrief
  publish_to: string[] | null
  result_url: string | null
  /** Same-origin, tenant-authorized playback endpoint from the control plane. */
  stream_url?: string | null
  /** Same-origin, tenant-authorized download endpoint from the control plane. */
  download_url?: string | null
  error_message: string | null
  detail: Record<string, unknown> | null
  created_at: string
  updated_at: string
  started_at: string | null
  completed_at: string | null
}

export interface VideoJobCreatePayload {
  brief: VideoBrief
  publish_to?: string[]
}

export interface VideoSyncResult {
  examined: number
  updated: number
}
