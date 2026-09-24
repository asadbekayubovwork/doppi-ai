import type { ChannelKind } from "./types"

export interface ChannelMeta {
  /** i18n key of the short name for tables and filters. */
  label: string
  /** i18n key of the full product name for detail views. */
  product: string
  icon: string
  /** Brand tint applied to the icon. */
  tone: string
}

export const CHANNELS: Record<ChannelKind, ChannelMeta> = {
  instagram: {
    label: "dashboard.rag.channels.instagram.label",
    product: "dashboard.rag.channels.instagram.product",
    icon: "instagram",
    tone: "text-[#E1306C]",
  },
  telegram: {
    label: "dashboard.rag.channels.telegram.label",
    product: "dashboard.rag.channels.telegram.product",
    icon: "send",
    tone: "text-[#229ED9]",
  },
  whatsapp: {
    label: "dashboard.rag.channels.whatsapp.label",
    product: "dashboard.rag.channels.whatsapp.product",
    icon: "message-circle",
    tone: "text-[#25B861]",
  },
  web: {
    label: "dashboard.rag.channels.web.label",
    product: "dashboard.rag.channels.web.product",
    icon: "globe",
    tone: "text-[#6A6A74]",
  },
}

export const CHANNEL_KINDS = Object.keys(CHANNELS) as ChannelKind[]
