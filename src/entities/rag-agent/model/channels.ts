import type { ChannelKind } from "./types"

export interface ChannelMeta {
  /** Short name for tables and filters. */
  label: string
  /** Full product name for detail views. */
  product: string
  icon: string
  /** Brand tint applied to the icon. */
  tone: string
}

export const CHANNELS: Record<ChannelKind, ChannelMeta> = {
  instagram: {
    label: "Instagram",
    product: "Instagram",
    icon: "instagram",
    tone: "text-[#E1306C]",
  },
  telegram: {
    label: "Telegram",
    product: "Telegram",
    icon: "send",
    tone: "text-[#229ED9]",
  },
  whatsapp: {
    label: "WhatsApp",
    product: "WhatsApp Business",
    icon: "message-circle",
    tone: "text-[#25B861]",
  },
  web: {
    label: "Web widget",
    product: "Web widget",
    icon: "globe",
    tone: "text-[#6A6A74]",
  },
}

export const CHANNEL_KINDS = Object.keys(CHANNELS) as ChannelKind[]
