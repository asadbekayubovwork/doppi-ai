export const ACTIVE_VIDEO_STATUSES = new Set([
  "submitting",
  "queued",
  "processing",
])

export const videoRequestKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-video`
}

export const secureReferenceUrls = (raw: string) => {
  const values = raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
  for (const value of values) {
    const parsed = new URL(value)
    if (parsed.protocol !== "https:")
      throw new Error("Only HTTPS reference URLs are accepted.")
  }
  return values
}

export const optionalVideoText = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}
