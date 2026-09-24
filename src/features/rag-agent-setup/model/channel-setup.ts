import type { ChannelKind } from "@/entities/rag-agent"

/** Every text field below is an i18n key; `example` is shown as-is. */
export interface CredentialField {
  key: string
  label: string
  /** Sample value for the field, the same in every language. */
  example?: string
  /** Placeholder text for fields that have no sample value. */
  placeholder?: string
  secret?: boolean
  isValid: (value: string) => boolean
  /** Shown once the value is non-empty but still fails `isValid`. */
  invalidHint: string
}

export interface ChannelSetup {
  title: string
  caption: string
  /** The checklist and save-problem label for the channel's credentials. */
  credentials: string
  fields: CredentialField[]
}

const text = (key: string) => `dashboard.rag.credentials.${key}`

const channelText = (kind: ChannelKind) => ({
  title: `dashboard.rag.channels.${kind}.product`,
  caption: `dashboard.rag.channels.${kind}.caption`,
  credentials: `dashboard.rag.channels.${kind}.credentials`,
})

const verifyTokenField: CredentialField = {
  key: "verifyToken",
  label: text("verifyToken.label"),
  placeholder: text("verifyToken.placeholder"),
  secret: true,
  isValid: (value) => value.trim().length >= 16,
  invalidHint: text("verifyToken.hint"),
}

const appSecretField: CredentialField = {
  key: "appSecret",
  label: text("appSecret.label"),
  placeholder: text("appSecret.placeholder"),
  secret: true,
  isValid: (value) => value.trim().length >= 20,
  invalidHint: text("appSecret.hint"),
}

export const CHANNEL_SETUP: Record<ChannelKind, ChannelSetup> = {
  instagram: {
    ...channelText("instagram"),
    fields: [
      {
        key: "pageId",
        label: text("pageId.label"),
        example: "17841400000000000",
        isValid: (value) => /^\d{8,30}$/.test(value.trim()),
        invalidHint: text("pageId.hint"),
      },
      {
        key: "accessToken",
        label: text("metaAccessToken.label"),
        example: "EAA…",
        secret: true,
        isValid: (value) => value.trim().length >= 20,
        invalidHint: text("metaAccessToken.hint"),
      },
      verifyTokenField,
      appSecretField,
    ],
  },
  telegram: {
    ...channelText("telegram"),
    fields: [
      {
        key: "botToken",
        label: text("botToken.label"),
        example: "123456789:AAH…",
        secret: true,
        isValid: (value) => /^\d{6,12}:[\w-]{30,}$/.test(value.trim()),
        invalidHint: text("botToken.hint"),
      },
    ],
  },
  whatsapp: {
    ...channelText("whatsapp"),
    fields: [
      {
        key: "phoneNumberId",
        label: text("phoneNumberId.label"),
        example: "109876543210987",
        isValid: (value) => /^\d{10,20}$/.test(value.trim()),
        invalidHint: text("phoneNumberId.hint"),
      },
      {
        key: "accessToken",
        label: text("cloudAccessToken.label"),
        example: "EAAG…",
        secret: true,
        isValid: (value) => value.trim().length >= 20,
        invalidHint: text("cloudAccessToken.hint"),
      },
      verifyTokenField,
      appSecretField,
    ],
  },
  web: {
    ...channelText("web"),
    fields: [
      {
        key: "domain",
        label: text("domain.label"),
        example: "aura.uz",
        isValid: (value) =>
          /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
            value.trim()
          ),
        invalidHint: text("domain.hint"),
      },
    ],
  },
}

/** Offered from the start; the rest come from "Add another channel". */
export const DEFAULT_CHANNELS: ChannelKind[] = [
  "instagram",
  "telegram",
  "whatsapp",
]
