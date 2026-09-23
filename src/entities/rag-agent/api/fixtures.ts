import type { ConversationDetail, ConversationSummary } from "../model/types"
import type {
  LegacyConversationDetail,
  LegacyRagAgent,
  LegacySourceCitation,
} from "./legacyFixtureTypes"

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString()

const DOCS = {
  catalogue: "Product catalogue 2026.pdf",
  pricing: "Pricing & discounts.xlsx",
  returns: "Return policy (UZ/RU/EN).docx",
  delivery: "Delivery terms.pdf",
  faq: "Store FAQ.docx",
}

export const AGENT_FIXTURE: LegacyRagAgent = {
  id: "agent_aura",
  name: "Aura Support Agent",
  description: "Answers product, pricing and delivery questions",
  status: "live",
  model: "gpt-4o",
  temperature: 0.3,
  documentCount: 128,
  chunkCount: 24_381,
  channels: ["instagram", "telegram", "whatsapp"],
  syncedAt: minutesAgo(4),
  stats: {
    conversations: 8_942,
    conversationsChange: 0.124,
    messages30d: 38_204,
    messagesChange: 0.097,
    avgResponseMs: 1_400,
    avgResponseChangeMs: -220,
    answerAccuracy: 0.942,
    answerAccuracyChange: 0.018,
    escalationRate: 0.036,
    escalationRateChange: -0.009,
  },
}

interface ConversationSeed extends Omit<ConversationSummary, "updatedAt"> {
  minutesAgo: number
  customer: ConversationDetail["customer"]
  reply: string
  citation: LegacySourceCitation
}

const SEEDS: ConversationSeed[] = [
  {
    id: "chat_8f21c04a",
    channel: "instagram",
    lastMessage: "Buyurtmam qachon yetadi?",
    messageCount: 14,
    status: "resolved",
    minutesAgo: 2,
    customer: { name: "Jasur Toshmatov", contact: "@jasur.t" },
    reply:
      "Buyurtmangiz #40211 bugun kuryerga topshirildi, ertaga 18:00 gacha yetkaziladi.",
    citation: { document: DOCS.delivery, location: "p.2" },
  },
  {
    id: "chat_7b09e2d1",
    channel: "telegram",
    lastMessage: "Do you ship on weekends?",
    messageCount: 8,
    status: "resolved",
    minutesAgo: 11,
    customer: { name: "Anna Petrova", contact: "@anna_pv" },
    reply:
      "Yes — Saturday deliveries run 10:00–16:00 in Tashkent. Sunday orders ship on Monday.",
    citation: { document: DOCS.delivery, location: "p.3" },
  },
  {
    id: "chat_5c73aa90",
    channel: "whatsapp",
    lastMessage: "Narxlar ro'yxatini bering",
    messageCount: 22,
    status: "active",
    minutesAgo: 18,
    customer: { name: "Madina Karimova", contact: "+998 90 123 45 67" },
    reply: "",
    citation: { document: DOCS.pricing, location: "sheet 1" },
  },
  {
    id: "chat_2e14bb37",
    channel: "web",
    lastMessage: "What is the refund window?",
    messageCount: 6,
    status: "resolved",
    minutesAgo: 34,
    customer: { name: "Website visitor", contact: "visitor #5821" },
    reply:
      "You can return unused items within 14 days of delivery for a full refund.",
    citation: { document: DOCS.returns, location: "§1" },
  },
  {
    id: "chat_9a45df82",
    channel: "instagram",
    lastMessage: "Can I change the address?",
    messageCount: 11,
    status: "escalated",
    minutesAgo: 47,
    customer: { name: "Dilnoza Rahimova", contact: "@dilnoza.r" },
    reply:
      "The order has already left the warehouse, so I've passed this to our delivery team — they'll message you shortly.",
    citation: { document: DOCS.delivery, location: "p.5" },
  },
  {
    id: "chat_1d38ce65",
    channel: "telegram",
    lastMessage: "Kafolat muddati necha oy?",
    messageCount: 5,
    status: "resolved",
    minutesAgo: 60,
    customer: { name: "Bekzod Aliyev", contact: "@bekzod_a" },
    reply: "Barcha Aura qurilmalariga 12 oylik rasmiy kafolat beriladi.",
    citation: { document: DOCS.catalogue, location: "p.31" },
  },
  {
    id: "chat_6f52ab19",
    channel: "whatsapp",
    lastMessage: "Blue model in stock?",
    messageCount: 17,
    status: "active",
    minutesAgo: 75,
    customer: { name: "Timur Yusupov", contact: "+998 93 456 78 12" },
    reply:
      "Aura Pro in blue is in stock at the Chilonzor store; online delivery takes 1–2 days.",
    citation: { document: DOCS.catalogue, location: "p.9" },
  },
  {
    id: "chat_3b27fc48",
    channel: "web",
    lastMessage: "Invoice for order #40128?",
    messageCount: 9,
    status: "resolved",
    minutesAgo: 120,
    customer: { name: "Nodir Qodirov", contact: "nodir@qodirov.uz" },
    reply:
      "Invoices are emailed after payment; you can also download yours from My orders.",
    citation: { document: DOCS.faq, location: "§6" },
  },
  {
    id: "chat_0e91da53",
    channel: "instagram",
    lastMessage: "Ish vaqtingiz qachon tugaydi?",
    messageCount: 4,
    status: "resolved",
    minutesAgo: 180,
    customer: { name: "Sevara Nazarova", contact: "@sevara.nz" },
    reply: "Do'konlarimiz har kuni 09:00 dan 21:00 gacha ishlaydi.",
    citation: { document: DOCS.faq, location: "§1" },
  },
  {
    id: "chat_4c60ef77",
    channel: "telegram",
    lastMessage: "Bulk pricing for 200 units?",
    messageCount: 13,
    status: "escalated",
    minutesAgo: 240,
    customer: { name: "Rustam Ergashev", contact: "@rustam_b2b" },
    reply:
      "Orders from 200 units get contract pricing, so I've handed you to our sales manager.",
    citation: { document: DOCS.pricing, location: "sheet 3" },
  },
  {
    id: "chat_7d18ba26",
    channel: "instagram",
    lastMessage: "Yangi kolleksiya qachon keladi?",
    messageCount: 7,
    status: "resolved",
    minutesAgo: 300,
    customer: { name: "Malika Saidova", contact: "@malika.s" },
    reply: "Kuzgi kolleksiya 1-oktabrdan sotuvga chiqadi.",
    citation: { document: DOCS.catalogue, location: "p.2" },
  },
  {
    id: "chat_b2f4c118",
    channel: "telegram",
    lastMessage: "Can I pay by card on delivery?",
    messageCount: 10,
    status: "resolved",
    minutesAgo: 360,
    customer: { name: "Oleg Kim", contact: "@olegkim" },
    reply: "Yes, couriers accept Uzcard, Humo and Visa at the door.",
    citation: { document: DOCS.faq, location: "§4" },
  },
  {
    id: "chat_e5a09d34",
    channel: "whatsapp",
    lastMessage: "Buyurtmani bekor qilsam?",
    messageCount: 15,
    status: "escalated",
    minutesAgo: 420,
    customer: { name: "Aziza Umarova", contact: "+998 97 765 43 21" },
    reply:
      "Buyurtma allaqachon to'langan, shuning uchun bekor qilishni operatorimizga uzatdim.",
    citation: { document: DOCS.returns, location: "§3" },
  },
  {
    id: "chat_c81e7f20",
    channel: "web",
    lastMessage: "Toshkentda do'koningiz bormi?",
    messageCount: 5,
    status: "resolved",
    minutesAgo: 540,
    customer: { name: "Website visitor", contact: "visitor #5790" },
    reply: "Ha, Chilonzor va Yunusobodda ikkita do'konimiz bor.",
    citation: { document: DOCS.faq, location: "§2" },
  },
  {
    id: "chat_a3f6d219",
    channel: "telegram",
    lastMessage: "Muddatli to'lov bormi?",
    messageCount: 12,
    status: "resolved",
    minutesAgo: 660,
    customer: { name: "Shoxrux Mirzayev", contact: "@shoxrux_m" },
    reply: "Ha, 3, 6 va 12 oyga foizsiz muddatli to'lov mavjud.",
    citation: { document: DOCS.pricing, location: "sheet 2" },
  },
  {
    id: "chat_f09b4e71",
    channel: "instagram",
    lastMessage: "Is the Aura Pro waterproof?",
    messageCount: 6,
    status: "resolved",
    minutesAgo: 780,
    customer: { name: "Kamila Rashidova", contact: "@kamila.rsh" },
    reply:
      "Aura Pro is IP67 rated — safe from splashes and brief immersion, but not for swimming.",
    citation: { document: DOCS.catalogue, location: "p.12" },
  },
  {
    id: "chat_d47c2a88",
    channel: "web",
    lastMessage: "Where is my tracking number?",
    messageCount: 9,
    status: "escalated",
    minutesAgo: 900,
    customer: { name: "Farrux Xolmatov", contact: "farrux@mail.uz" },
    reply:
      "I couldn't find a tracking number for this order, so a teammate will check with the courier.",
    citation: { document: DOCS.delivery, location: "p.4" },
  },
  {
    id: "chat_19e8b5c3",
    channel: "whatsapp",
    lastMessage: "Samarqandga yetkazib berasizmi?",
    messageCount: 8,
    status: "resolved",
    minutesAgo: 1_080,
    customer: { name: "Gulnora Tursunova", contact: "+998 91 234 56 78" },
    reply: "Ha, Samarqandga 1–2 ish kunida yetkazamiz.",
    citation: { document: DOCS.delivery, location: "p.2" },
  },
  {
    id: "chat_6b2ad904",
    channel: "telegram",
    lastMessage: "Do you have a loyalty program?",
    messageCount: 4,
    status: "resolved",
    minutesAgo: 1_320,
    customer: { name: "Elena Sokolova", contact: "@lena_sk" },
    reply: "Aura Club gives 5% back on every purchase — sign up in the app.",
    citation: { document: DOCS.faq, location: "§8" },
  },
  {
    id: "chat_3e57f1b6",
    channel: "instagram",
    lastMessage: "Chegirma kodi ishlamayapti",
    messageCount: 11,
    status: "resolved",
    minutesAgo: 1_500,
    customer: { name: "Ulug'bek Hamidov", contact: "@ulugbek.h" },
    reply:
      "AURA10 kodi faqat 500 000 so'mdan yuqori buyurtmalarga amal qiladi.",
    citation: { document: DOCS.pricing, location: "sheet 4" },
  },
]

const toSummary = (seed: ConversationSeed): ConversationSummary => ({
  id: seed.id,
  channel: seed.channel,
  lastMessage: seed.lastMessage,
  messageCount: seed.messageCount,
  status: seed.status,
  updatedAt: minutesAgo(seed.minutesAgo),
})

/** The customer's question and the agent's answer — enough to open any chat. */
const excerptThread = (seed: ConversationSeed): LegacyConversationDetail => ({
  ...toSummary(seed),
  customer: seed.customer,
  startedAt: minutesAgo(seed.minutesAgo + 6),
  agentMessageCount: Math.floor(seed.messageCount / 2),
  handledBy: AGENT_FIXTURE.name,
  handoverTo: seed.status === "escalated" ? "Support team" : null,
  messages: [
    {
      id: `${seed.id}_q`,
      author: "customer",
      text: seed.lastMessage,
      sentAt: minutesAgo(seed.minutesAgo + 1),
    },
    {
      id: `${seed.id}_a`,
      author: "agent",
      text: seed.reply,
      sentAt: minutesAgo(seed.minutesAgo),
      citations: [seed.citation],
      trace: { model: "gpt-4o", latencyMs: 1_300, chunks: 3 },
    },
  ],
  retrievedSources: [
    { document: seed.citation.document, chunksUsed: 3, score: 0.9 },
  ],
  tags: [],
  rating: null,
})

const pricingThread = (seed: ConversationSeed): LegacyConversationDetail => ({
  ...toSummary(seed),
  customer: seed.customer,
  startedAt: minutesAgo(36),
  agentMessageCount: 11,
  handledBy: AGENT_FIXTURE.name,
  handoverTo: null,
  messages: [
    {
      id: "msg_01",
      author: "customer",
      text: "Salom! Narxlar ro'yxatini yuborasizmi?",
      sentAt: minutesAgo(36),
    },
    {
      id: "msg_02",
      author: "agent",
      text: "Salom, Madina! Albatta. 2026 katalogidagi asosiy narxlar: Aura Mini — 1 290 000 so'm, Aura Pro — 2 450 000 so'm. To'liq ro'yxatni PDF holida ham yuboraman.",
      sentAt: minutesAgo(36),
      citations: [
        { document: DOCS.pricing, location: "sheet 1" },
        { document: DOCS.catalogue, location: "p.14" },
      ],
      trace: { model: "gpt-4o", latencyMs: 1_200, chunks: 3 },
      feedback: "positive",
    },
    {
      id: "msg_03",
      author: "customer",
      text: "Ulgurji buyurtmaga chegirma bormi?",
      sentAt: minutesAgo(33),
    },
    {
      id: "msg_04",
      author: "agent",
      text: "Ha. 50 donadan ortiq buyurtmalarda 12% chegirma, 200 donadan boshlab esa alohida shartnoma narxi taklif qilinadi.",
      sentAt: minutesAgo(32),
      citations: [{ document: DOCS.pricing, location: "sheet 3" }],
      trace: { model: "gpt-4o", latencyMs: 1_200, chunks: 3 },
      feedback: "positive",
    },
    {
      id: "msg_05",
      author: "customer",
      text: "Yetkazib berish Samarqandga qancha vaqt oladi?",
      sentAt: minutesAgo(29),
    },
    {
      id: "msg_06",
      author: "agent",
      text: "Samarqandga yetkazib berish 1–2 ish kuni, 500 000 so'mdan yuqori buyurtmalarda bepul.",
      sentAt: minutesAgo(29),
      citations: [{ document: DOCS.returns, location: "§4" }],
      trace: { model: "gpt-4o", latencyMs: 1_200, chunks: 3 },
      feedback: "positive",
    },
  ],
  retrievedSources: [
    { document: DOCS.pricing, chunksUsed: 4, score: 0.94 },
    { document: DOCS.catalogue, chunksUsed: 3, score: 0.87 },
    { document: DOCS.returns, chunksUsed: 2, score: 0.71 },
  ],
  tags: ["pricing", "wholesale", "delivery"],
  rating: { score: 5, outOf: 5, comment: "Tez va aniq javob berdi" },
})

export const CONVERSATION_SUMMARIES: ConversationSummary[] =
  SEEDS.map(toSummary)

export const CONVERSATION_DETAILS: LegacyConversationDetail[] = SEEDS.map(
  (seed) =>
    seed.id === "chat_5c73aa90" ? pricingThread(seed) : excerptThread(seed)
)
