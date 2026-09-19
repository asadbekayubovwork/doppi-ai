import { computed, ref } from "vue"
import { CHANNEL_KINDS, type ChannelKind } from "@/entities/rag-agent"
import { CHANNEL_SETUP } from "./channel-setup"

export interface ChannelDraft {
  kind: ChannelKind
  enabled: boolean
  /**
   * Already live on the server. Saved credentials never come back to the
   * browser, so a connected channel starts with empty fields.
   */
  connected: boolean
  credentials: Record<string, string>
}

export const channelDraft = (
  kind: ChannelKind,
  { enabled = false, connected = false } = {}
): ChannelDraft => ({
  kind,
  enabled,
  connected,
  credentials: Object.fromEntries(
    CHANNEL_SETUP[kind].fields.map((field) => [field.key, ""])
  ),
})

export const isChannelReady = (channel: ChannelDraft): boolean =>
  CHANNEL_SETUP[channel.kind].fields.every((field) =>
    field.isValid(channel.credentials[field.key] ?? "")
  )

export const hasTypedCredentials = (channel: ChannelDraft): boolean =>
  Object.values(channel.credentials).some((value) => value.trim() !== "")

/** The channel list both agent screens edit, with its switch and field handlers. */
export function useChannelDrafts(initial: ChannelDraft[]) {
  const channels = ref<ChannelDraft[]>(initial)

  const find = (kind: ChannelKind) =>
    channels.value.find((item) => item.kind === kind)

  const setChannelEnabled = (kind: ChannelKind, enabled: boolean) => {
    const channel = find(kind)
    if (channel) channel.enabled = enabled
  }

  const setCredential = (kind: ChannelKind, key: string, value: string) => {
    const channel = find(kind)
    if (channel) channel.credentials[key] = value
  }

  const availableChannels = computed(() =>
    CHANNEL_KINDS.filter((kind) => !find(kind))
  )

  const addChannel = (kind: ChannelKind) => {
    if (!find(kind)) channels.value.push(channelDraft(kind, { enabled: true }))
  }

  return {
    channels,
    availableChannels,
    setChannelEnabled,
    setCredential,
    addChannel,
  }
}
