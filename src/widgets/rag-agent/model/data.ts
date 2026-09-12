export type ChatStatus = "Resolved" | "Active" | "Escalated"

export interface Conversation {
  id: string
  channel: "Instagram" | "Telegram" | "WhatsApp" | "Web widget"
  message: string
  messages: number
  status: ChatStatus
  updated: string
}

export const agentMetrics = [
  { label: "Conversations", value: "8,942", change: "+12.4%" },
  { label: "Messages · 30 days", value: "38,204", change: "+9.7%" },
  { label: "Avg. response time", value: "1.4s", change: "-220 ms" },
  { label: "Answer accuracy", value: "94.2%", change: "+1.8%" },
  { label: "Escalated to human", value: "3.6%", change: "-0.9%" },
]

export const conversations: Conversation[] = [
  { id: "chat_8f21c04a", channel: "Instagram", message: "Buyurtmam qachon yetadi?", messages: 14, status: "Resolved", updated: "2 min" },
  { id: "chat_7b09e2d1", channel: "Telegram", message: "Do you ship on weekends?", messages: 8, status: "Resolved", updated: "11 min" },
  { id: "chat_5c73aa90", channel: "WhatsApp", message: "Narxlar ro'yxatini bering", messages: 22, status: "Active", updated: "18 min" },
  { id: "chat_2e14bb37", channel: "Web widget", message: "What is the refund window?", messages: 6, status: "Resolved", updated: "34 min" },
  { id: "chat_9a45df82", channel: "Instagram", message: "Can I change the address?", messages: 11, status: "Escalated", updated: "47 min" },
  { id: "chat_1d38ce65", channel: "Telegram", message: "Kafolat muddati necha oy?", messages: 5, status: "Resolved", updated: "1 h" },
  { id: "chat_6f52ab19", channel: "WhatsApp", message: "Blue model in stock?", messages: 17, status: "Active", updated: "1 h" },
  { id: "chat_3b27fc48", channel: "Web widget", message: "Invoice for order #40128?", messages: 9, status: "Resolved", updated: "2 h" },
  { id: "chat_0e91da53", channel: "Instagram", message: "Ish vaqtingiz qachon tugaydi?", messages: 4, status: "Resolved", updated: "3 h" },
  { id: "chat_4c60ef77", channel: "Telegram", message: "Bulk pricing for 200 units?", messages: 13, status: "Escalated", updated: "4 h" },
  { id: "chat_7d18ba26", channel: "Instagram", message: "Yangi kolleksiya qachon keladi?", messages: 7, status: "Resolved", updated: "5 h" },
  { id: "chat_b2f4c118", channel: "Telegram", message: "Can I pay by card on delivery?", messages: 10, status: "Resolved", updated: "6 h" },
]

export const knowledgeDocuments = [
  { name: "Product catalogue 2026.pdf", meta: "842 chunks · 12.4 MB", type: "file-text", status: "Indexed" },
  { name: "Pricing & discounts.xlsx", meta: "190 chunks · 1.1 MB", type: "file-spreadsheet", status: "Indexed" },
  { name: "Return policy (UZ/RU/EN).docx", meta: "64 chunks · 320 KB", type: "file-type", status: "Syncing" },
]

export const connectedChannels = [
  { name: "Instagram", detail: "@aura.store · key •••• 4f2a", icon: "instagram", state: "Connected" },
  { name: "Telegram", detail: "@aura_support_bot · •••• 91c7", icon: "send", state: "Connected" },
  { name: "WhatsApp Business", detail: "+998 90 123 45 67 · expired", icon: "message-circle", state: "Reconnect" },
]
