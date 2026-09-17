import {
  CHANNELS,
  type ChatMessage,
  type ConversationDetail,
} from "@/entities/rag-agent"
import { formatClockTime, formatDayLabel } from "@/shared/lib"

export interface MessageGroup {
  key: string
  /** "Today · 14:02" — the day and the time of its first message. */
  label: string
  messages: ChatMessage[]
}

/** Splits a transcript into calendar-day sections, keeping message order. */
export function groupMessagesByDay(
  messages: ChatMessage[],
  now = new Date()
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
        label: `${formatDayLabel(message.sentAt, now)} · ${formatClockTime(message.sentAt)}`,
        messages: [message],
      })
    }
  }
  return groups
}

/** Plain-text transcript for "Export transcript". */
export function transcriptToText(conversation: ConversationDetail): string {
  const authorName = (message: ChatMessage) =>
    ({
      customer: conversation.customer.name,
      agent: conversation.handledBy,
      operator: "Operator",
    })[message.author]

  const lines = [
    `Conversation ${conversation.id}`,
    `Channel: ${CHANNELS[conversation.channel].product}`,
    `Customer: ${conversation.customer.name} (${conversation.customer.contact})`,
    `Started: ${new Date(conversation.startedAt).toLocaleString("en-GB")}`,
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
      lines.push(`    Sources: ${sources}`)
    }
  }

  return lines.join("\n")
}
