import { effectScope } from "vue"
import { ragAgentApi } from "@/entities/rag-agent"
import { useAgentSetupForm, type AgentSetupForm } from "../useAgentSetupForm"

const TELEGRAM_TOKEN = "7742150983:AAF91c7kQx2mZ8vN3pL5tR9wY1bH6dJ4sE0"

const file = (name: string, bytes = 2_048) =>
  new File([new Uint8Array(bytes)], name)

const openItems = (form: AgentSetupForm) =>
  form.checklist.filter((item) => !item.done).map((item) => item.label)

describe("agent setup form", () => {
  let scope: ReturnType<typeof effectScope>
  let form: AgentSetupForm

  beforeEach(() => {
    vi.useFakeTimers()
    scope = effectScope()
    form = scope.run(() => useAgentSetupForm("business-test"))!
    form.configureLimits(50 * 1024 * 1024)
    vi.spyOn(ragAgentApi, "uploadDocument").mockResolvedValue("document-test")
    vi.spyOn(ragAgentApi, "listDocuments").mockResolvedValue([
      {
        document_id: "document-test",
        name: "policy.docx",
        size_bytes: 2048,
        chunk_count: 3,
        status: "indexed",
        progress: 1,
        error: null,
      },
    ])
    vi.spyOn(ragAgentApi, "deleteDocument").mockResolvedValue()
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  it("starts blocked on the required steps, with unused channels as suggestions", () => {
    expect(form.canSubmit).toBe(false)
    expect(form.missing.map((item) => item.key)).toEqual([
      "name",
      "documents",
      "model",
      "prompt",
    ])
    const channelItems = form.checklist.filter((item) =>
      item.key.startsWith("channel-")
    )
    expect(channelItems.every((item) => item.optional)).toBe(true)
  })

  it("skips unsupported, oversized and duplicate files", () => {
    const huge = file("catalogue.pdf")
    Object.defineProperty(huge, "size", { value: 60 * 1024 * 1024 })

    const rejected = form.addFiles([
      file("prices.xlsx"),
      file("prices.xlsx"),
      file("photo.png"),
      huge,
    ])

    expect(rejected.map(({ file, reason }) => [file.name, reason])).toEqual([
      ["prices.xlsx", "already added"],
      ["photo.png", "unsupported file type"],
      ["catalogue.pdf", "larger than the configured limit"],
    ])
    expect(form.documents).toHaveLength(1)
  })

  it("waits for indexing before the documents step counts as done", async () => {
    form.addFiles([file("policy.docx")])
    expect(form.documents[0].status).toBe("embedding")
    expect(openItems(form)).toContain("Documents uploaded & indexed")

    await vi.runAllTimersAsync()

    expect(form.documents[0]).toMatchObject({ status: "indexed", progress: 1 })
    expect(openItems(form)).not.toContain("Documents uploaded & indexed")
  })

  it("treats removing a document mid-upload as a cancel, not a failure", async () => {
    form.addFiles([file("policy.docx")])
    form.removeDocument(form.documents[0].key)
    await vi.runAllTimersAsync()

    expect(form.documents).toHaveLength(0)
  })

  it("blocks on a channel switched on without valid credentials", () => {
    form.setChannelEnabled("telegram", true)
    form.setCredential("telegram", "botToken", "not-a-token")

    expect(form.missing.map((item) => item.label)).toContain(
      "Telegram credentials"
    )

    form.setCredential("telegram", "botToken", TELEGRAM_TOKEN)

    expect(openItems(form)).not.toContain("Telegram credentials")
  })

  it("submits only indexed documents and enabled channels", async () => {
    form.name = "  Aura Support Agent "
    form.model = "google/gemma-4-31B-it"
    form.systemPrompt = "Answer from the documents."
    form.addFiles([file("policy.docx")])
    form.setChannelEnabled("telegram", true)
    form.setCredential("telegram", "botToken", TELEGRAM_TOKEN)
    await vi.runAllTimersAsync()

    expect(form.canSubmit).toBe(true)
    const payload = form.toPayload()
    expect(payload.name).toBe("Aura Support Agent")
    expect(payload.collections).toHaveLength(1)
    expect(payload.channels).toEqual([
      { kind: "telegram", credentials: { botToken: TELEGRAM_TOKEN } },
    ])
  })

  it("offers channels that are not on the list yet", () => {
    expect(form.availableChannels).toEqual(["web"])
    form.addChannel("web")
    expect(form.availableChannels).toEqual([])
    expect(form.channels.at(-1)).toMatchObject({ kind: "web", enabled: true })
  })
})
