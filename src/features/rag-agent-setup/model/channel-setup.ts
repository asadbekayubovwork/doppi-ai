import type { ChannelKind } from "@/entities/rag-agent"

export interface CredentialField {
  key: string
  label: string
  placeholder: string
  secret?: boolean
  isValid: (value: string) => boolean
  /** Shown once the value is non-empty but still fails `isValid`. */
  invalidHint: string
}

export interface ChannelSetup {
  title: string
  caption: string
  fields: CredentialField[]
}

const filled = (value: string) => value.trim().length > 0

export const CHANNEL_SETUP: Record<ChannelKind, ChannelSetup> = {
  instagram: {
    title: "Instagram",
    caption: "Direct messages",
    fields: [
      {
        key: "login",
        label: "Login",
        placeholder: "@your.store",
        isValid: (value) => /^@?[\w.]{1,30}$/.test(value.trim()),
        invalidHint:
          "Use the account handle: letters, digits, dots and underscores.",
      },
      {
        key: "password",
        label: "Password",
        placeholder: "Account password",
        secret: true,
        isValid: filled,
        invalidHint: "Enter the account password.",
      },
    ],
  },
  telegram: {
    title: "Telegram",
    caption: "Bot API",
    fields: [
      {
        key: "botToken",
        label: "Bot token",
        placeholder: "123456789:AAH…",
        secret: true,
        isValid: (value) => /^\d{6,12}:[\w-]{30,}$/.test(value.trim()),
        invalidHint:
          "Paste the token from @BotFather: digits, a colon, then the key.",
      },
    ],
  },
  whatsapp: {
    title: "WhatsApp Business",
    caption: "Cloud API",
    fields: [
      {
        key: "phoneNumberId",
        label: "Phone number ID",
        placeholder: "109876543210987",
        isValid: (value) => /^\d{10,20}$/.test(value.trim()),
        invalidHint: "Digits only — copy it from WhatsApp Manager.",
      },
      {
        key: "accessToken",
        label: "Access token",
        placeholder: "EAAG…",
        secret: true,
        isValid: (value) => value.trim().length >= 20,
        invalidHint: "This looks too short for a Cloud API token.",
      },
    ],
  },
  web: {
    title: "Web widget",
    caption: "Chat bubble on your website",
    fields: [
      {
        key: "domain",
        label: "Website domain",
        placeholder: "aura.uz",
        isValid: (value) =>
          /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
            value.trim()
          ),
        invalidHint: "Enter a domain such as aura.uz, without https://.",
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
