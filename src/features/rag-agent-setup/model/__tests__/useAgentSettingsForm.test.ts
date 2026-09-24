import { effectScope } from "vue"
import { createI18n } from "vue-i18n"
import { messages } from "@/shared/config/i18n"
import { ragAgentApi, type RagAgent } from "@/entities/rag-agent"
import {
  useAgentSettingsForm,
  type AgentSettingsForm,
} from "../useAgentSettingsForm"

const TELEGRAM_TOKEN = "7742150983:AAF91c7kQx2mZ8vN3pL5tR9wY1bH6dJ4sE0"

// The form speaks in i18n keys; English keeps the assertions readable.
const { t } = createI18n({ legacy: false, locale: "en", messages }).global

const agent: RagAgent = {
  id: "agent-test",
  name: "Aura Support Agent",
  description: "Answers product questions",
  status: "live",
  model: "google/gemma-4-31B-it",
  temperature: 0.3,
  systemPrompt: "Answer from the documents.",
  collections: ["knowledge-test"],
  topK: 8,
  similarityThreshold: 0.1,
  documentCount: 1,
  chunkCount: 3,
  channels: ["telegram", "web"],
  syncedAt: new Date().toISOString(),
  stats: {
    conversations: 0,
    conversationsChange: 0,
    messages30d: 0,
    messagesChange: 0,
    avgResponseMs: 0,
    avgResponseChangeMs: 0,
    answerAccuracy: 0,
    answerAccuracyChange: 0,
    escalationRate: 0,
    escalationRateChange: 0,
  },
}

const labels = (form: AgentSettingsForm) =>
  form.changes.map((item) => t(item.label))
const problems = (form: AgentSettingsForm) =>
  form.problems.map((key) => t(key))

describe("agent settings form", () => {
  let scope: ReturnType<typeof effectScope>
  let form: AgentSettingsForm

  beforeEach(() => {
    scope = effectScope()
    form = scope.run(() => useAgentSettingsForm("business-test"))!
    form.reset(agent)
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("starts with no changes and the agent's channels switched on", () => {
    expect(form.changes).toEqual([])
    expect(
      form.channels.map(({ kind, enabled, connected }) => ({
        kind,
        enabled,
        connected,
      }))
    ).toEqual([
      { kind: "instagram", enabled: false, connected: false },
      { kind: "telegram", enabled: true, connected: true },
      { kind: "whatsapp", enabled: false, connected: false },
      { kind: "web", enabled: true, connected: true },
    ])
  })

  it("lists edits by section and saves only what changed", () => {
    form.systemPrompt = "Answer only from the documents."
    form.temperature = 0.5
    form.setChannelEnabled("web", false)

    expect(labels(form)).toEqual(["Temperature", "Prompt", "Web widget"])
    expect([...form.changedSections]).toEqual(["model", "prompt", "channels"])
    expect(form.toUpdate()).toEqual({
      agent: expect.objectContaining({
        name: agent.name,
        status: "live",
        temperature: 0.5,
        systemPrompt: "Answer only from the documents.",
      }),
      connect: [],
      disconnect: ["web"],
    })
  })

  it("leaves the agent untouched when only channels change", () => {
    form.setChannelEnabled("web", false)
    expect(form.toUpdate().agent).toBeNull()
  })

  it("resends a connected channel only once new credentials are typed", () => {
    expect(form.toUpdate().connect).toEqual([])

    form.setCredential("telegram", "botToken", "not-a-token")
    expect(labels(form)).toEqual(["Telegram"])
    expect(problems(form)).toEqual(["Telegram credentials"])

    form.setCredential("telegram", "botToken", TELEGRAM_TOKEN)
    expect(problems(form)).toEqual([])
    expect(form.toUpdate().connect).toEqual([
      { kind: "telegram", credentials: { botToken: TELEGRAM_TOKEN } },
    ])
  })

  it("needs credentials for a channel switched on for the first time", () => {
    form.setChannelEnabled("whatsapp", true)
    expect(labels(form)).toEqual(["WhatsApp Business"])
    expect(problems(form)).toEqual(["WhatsApp Business credentials"])
  })

  it("rejects retrieval settings outside their range", () => {
    form.topK = 0
    form.similarityThreshold = 2
    expect(problems(form)).toEqual(["Retrieved chunks", "Similarity threshold"])
  })

  it("discards the draft back to the saved agent", () => {
    form.name = "Renamed"
    form.setChannelEnabled("telegram", false)
    form.discard()
    expect(form.name).toBe(agent.name)
    expect(form.changes).toEqual([])
  })

  it("keeps the draft when the saved version moves under it", () => {
    form.systemPrompt = "New prompt"
    form.setChannelEnabled("web", false)

    form.rebase({ ...agent, status: "paused", channels: ["telegram"] })

    expect(form.systemPrompt).toBe("New prompt")
    expect(labels(form)).toEqual(["Prompt"])
    expect(form.toUpdate().agent?.status).toBe("paused")
  })

  it("loads the agent's documents and follows the ones still embedding", async () => {
    vi.useFakeTimers()
    const listDocuments = vi
      .spyOn(ragAgentApi, "listDocuments")
      .mockResolvedValueOnce([
        {
          document_id: "indexed-doc",
          name: "catalogue.pdf",
          size_bytes: 4096,
          chunk_count: 12,
          status: "indexed",
          progress: 1,
          error: null,
        },
        {
          document_id: "new-doc",
          name: "policy.docx",
          size_bytes: 2048,
          chunk_count: 0,
          status: "processing",
          progress: 0.4,
          error: null,
        },
      ])
      .mockResolvedValue([
        {
          document_id: "new-doc",
          name: "policy.docx",
          size_bytes: 2048,
          chunk_count: 3,
          status: "indexed",
          progress: 1,
          error: null,
        },
      ])

    await form.loadDocuments()
    expect(listDocuments).toHaveBeenCalledWith(
      "business-test",
      "knowledge-test"
    )
    expect(form.documents.map((item) => item.status)).toEqual([
      "indexed",
      "embedding",
    ])

    await vi.runAllTimersAsync()

    expect(form.documents[1]).toMatchObject({
      status: "indexed",
      chunkCount: 3,
      progress: 1,
    })
  })

  it("uploads new files into the agent's collection", () => {
    const upload = vi
      .spyOn(ragAgentApi, "uploadDocument")
      .mockReturnValue(new Promise(() => undefined))
    form.configureLimits(1024 * 1024)

    form.addFiles([new File(["x"], "faq.txt")])

    expect(upload).toHaveBeenCalledWith(
      "business-test",
      "knowledge-test",
      expect.any(File),
      expect.any(AbortSignal)
    )
  })
})
