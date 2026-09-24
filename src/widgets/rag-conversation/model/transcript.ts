import {
  CHANNELS,
  type ChatMessage,
  type ConversationDetail,
} from "@/entities/rag-agent"
import { formatClockTime, formatDate, formatDayLabel } from "@/shared/lib"

export interface MessageGroup {
  key: string
  /** "Today · 14:02" — the day and the time of its first message. */
  label: string
  messages: ChatMessage[]
}

type Translate = (key: string, named?: Record<string, unknown>) => string

/** Splits a transcript into calendar-day sections, keeping message order. */
export function groupMessagesByDay(
  messages: ChatMessage[],
  now = new Date(),
  locale = "en"
): MessageGroup[] {
  const groups: MessageGroup[] = []
  for (const message of messages) {
    const key = new Date(message.sentAt).toDateString()
    const current = groups[groups.length - 1]
    if (current?.key === key) {
      current.messages.push(message)
    } else {
      groups.push({
        key,
        label: `${formatDayLabel(message.sentAt, now, locale)} · ${formatClockTime(message.sentAt)}`,
        messages: [message],
      })
    }
  }
  return groups
}

/** Plain-text transcript for "Export transcript", in the language of `t`. */
export function transcriptToText(
  conversation: ConversationDetail,
  t: Translate,
  locale = "en"
): string {
  const file = (key: string, named: Record<string, unknown>) =>
    t(`dashboard.rag.conversation.file.${key}`, named)
  const authorName = (message: ChatMessage) =>
    ({
      customer: conversation.customer.name,
      agent: conversation.handledBy,
      operator: t("dashboard.rag.conversation.operator"),
    })[message.author]

  const lines = [
    file("title", { id: conversation.id }),
    file("channel", { channel: t(CHANNELS[conversation.channel].product) }),
    file("customer", {
      name: conversation.customer.name,
      contact: conversation.customer.contact,
    }),
    file("started", {
      date: formatDate(conversation.startedAt, locale, { withTime: true }),
    }),
    "",
  ]

  for (const message of conversation.messages) {
    lines.push(
      `[${formatClockTime(message.sentAt)}] ${authorName(message)}: ${message.text}`
    )
    if (message.citations?.length) {
      const sources = message.citations
        .map((citation) => `${citation.document} · ${citation.location}`)
        .join("; ")
      lines.push(`    ${file("sources", { sources })}`)
    }
  }

  return lines.join("\n")
}
