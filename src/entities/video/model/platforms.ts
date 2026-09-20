import type { PlatformKind } from "./types"

export interface PlatformMeta {
  label: string
  /** Short label used in dense rows ("Instagram", "TikTok", "YouTube"). */
  icon: string
  /** Brand-tinted icon colour. */
  color: string
  /** Soft background behind the icon. */
  bg: string
}

// Brand marks + tints for the three channels the workspace publishes to. The
// icon set has `instagram` natively; TikTok reuses the audio glyph and YouTube
// the play glyph, both tinted to their brand colour so rows stay recognisable.
export const PLATFORMS: Record<PlatformKind, PlatformMeta> = {
  instagram: {
    label: "Instagram",
    icon: "instagram",
    color: "#E1306C",
    bg: "#FDECF3",
  },
  tiktok: {
    label: "TikTok",
    icon: "audio-lines",
    color: "#111116",
    bg: "#F1F1EF",
  },
  youtube: {
    label: "YouTube",
    icon: "play",
    color: "#FF0000",
    bg: "#FEECEC",
  },
}

/** Longer channel labels used on the dashboard ("Instagram Reels"). */
export const PLATFORM_CHANNELS: Record<PlatformKind, string> = {
  instagram: "Instagram Reels",
  tiktok: "TikTok",
  youtube: "YouTube Shorts",
}
