import { flushPromises, mount } from "@vue/test-utils"
import { createPinia } from "pinia"
import { createHead } from "@unhead/vue/client"
import { createRouter, createMemoryHistory } from "vue-router"
import { HttpError } from "@/shared/api"
import {
  ragAgentApi,
  type ConversationDetail,
  type RagAgent,
} from "@/entities/rag-agent"
import { CDashboardSidebar } from "@/widgets/dashboard-sidebar"
import PRagAgent from "../PRagAgent.vue"
import PRagAgentCreate from "../PRagAgentCreate.vue"
import PRagAgentSettings from "../PRagAgentSettings.vue"
import PRagConversation from "../PRagConversation.vue"

const stub = { template: "<div />" }
const agent: RagAgent = {
  id: "agent-test",
  name: "Support agent",
  description: "Grounded answers",
  status: "live",
  model: "google/gemma-4-31B-it",
  temperature: 0.3,
  systemPrompt: "Use sources.",
  collections: ["knowledge-test"],
  topK: 8,
  similarityThreshold: 0.1,
  documentCount: 2,
  chunkCount: 12,
  channels: ["web"],
  syncedAt: new Date().toISOString(),
  stats: {
    conversations: 1,
    conversationsChange: 0,
    messages30d: 2,
    messagesChange: 0,
    avgResponseMs: 0,
    avgResponseChangeMs: 0,
    answerAccuracy: 0,
    answerAccuracyChange: 0,
    escalationRate: 0,
    escalationRateChange: 0,
  },
}

const conversation: ConversationDetail = {
  id: "session-test",
  channel: "web",
  lastMessage: "What is covered?",
  messageCount: 2,
  status: "active",
  updatedAt: new Date().toISOString(),
  customer: { name: "Widget visitor", contact: "visitor-1" },
  startedAt: new Date().toISOString(),
  agentMessageCount: 1,
  handledBy: "RAG agent",
  handoverTo: null,
  messages: [
    {
      id: "1",
      author: "customer",
      text: "What is covered?",
      sentAt: new Date().toISOString(),
    },
    {
      id: "2",
      author: "agent",
      text: "The policy covers the listed products.",
      sentAt: new Date().toISOString(),
      citations: [
        {
          document: "policy.docx",
          location: "chunk 7",
          chunkId: 7,
          excerpt: "Coverage applies to listed products.",
          vectorSimilarity: 0.82,
          rerankScore: 0.91,
        },
      ],
    },
  ],
  retrievedSources: [
    {
      document: "policy.docx",
      chunksUsed: 1,
      score: 0.91,
      chunks: [
        {
          chunkId: 7,
          content: "Coverage applies to listed products.",
          vectorSimilarity: 0.82,
          rerankScore: 0.91,
        },
      ],
    },
  ],
  tags: [],
  rating: null,
}

const mountAt = async (
  path: string,
  component: unknown,
  props: Record<string, unknown> = {}
) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/app/rag", name: "RagAgent", component: stub },
      { path: "/app/rag/create", name: "RagAgentCreate", component: stub },
      { path: "/app/rag/playground", name: "RagPlayground", component: stub },
      { path: "/app/rag/settings", name: "RagAgentSettings", component: stub },
      {
        path: "/app/rag/conversations/:chatId",
        name: "RagConversation",
        component: stub,
      },
      { path: "/:pathMatch(.*)*", component: stub },
    ],
  })
  const pinia = createPinia()
  pinia.state.value.auth = {
    status: "authenticated",
    businesses: [
      {
        id: "business-test",
        name: "Test",
        slug: "test",
        status: "active",
        default_language: "uz",
        billing_region: "UZ",
      },
    ],
    activeBusinessId: "business-test",
  }
  await router.push(path)
  const wrapper = mount(component as never, {
    props,
    global: { plugins: [pinia, router, createHead()] },
  })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.spyOn(ragAgentApi, "ensureTenant").mockResolvedValue({})
  vi.spyOn(ragAgentApi, "getLimits").mockResolvedValue({
    max_file_bytes: 1024 * 1024,
  } as never)
  vi.spyOn(ragAgentApi, "listModels").mockResolvedValue([
    {
      id: agent.model,
      displayName: "Gemma",
      provider: "GPU.UZ",
      contextTokens: 32768,
      inputUsdPerMillion: null,
      outputUsdPerMillion: null,
      currency: "USD",
      pricingConfigured: false,
      isDefault: true,
      capabilities: {},
    },
  ])
  vi.spyOn(ragAgentApi, "getAgent").mockResolvedValue(agent)
  vi.spyOn(ragAgentApi, "listConversations").mockResolvedValue([conversation])
  vi.spyOn(ragAgentApi, "getConversation").mockResolvedValue(conversation)
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => vi.restoreAllMocks())

describe("RAG agent pages", () => {
  it("renders data loaded through the RAG API", async () => {
    const wrapper = await mountAt("/app/rag", PRagAgent)
    expect(wrapper.text()).toContain("Support agent")
    expect(wrapper.text()).toContain("1 chats")
    wrapper.unmount()
  })

  it("renders conversation evidence from persisted source chunks", async () => {
    const wrapper = await mountAt(
      "/app/rag/conversations/session-test",
      PRagConversation,
      { chatId: "session-test" }
    )
    expect(wrapper.text()).toContain("Widget visitor")
    expect(wrapper.text()).toContain("policy.docx")
    expect(wrapper.text()).toContain("View evidence chunks")
    wrapper.unmount()
  })

  it("shows not found only for a 404 conversation response", async () => {
    vi.spyOn(ragAgentApi, "getConversation").mockRejectedValue(
      new HttpError(new Response(null, { status: 404 }))
    )
    const wrapper = await mountAt(
      "/app/rag/conversations/missing",
      PRagConversation,
      { chatId: "missing" }
    )
    expect(wrapper.text()).toContain("Conversation not found")
    wrapper.unmount()
  })

  it("renders dynamic model options", async () => {
    const wrapper = await mountAt("/app/rag/create", PRagAgentCreate)
    expect(wrapper.text()).toContain("Gemma")
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe("RAG agent configuration page", () => {
  beforeEach(() => {
    vi.spyOn(ragAgentApi, "listDocuments").mockResolvedValue([
      {
        document_id: "document-test",
        name: "policy.docx",
        size_bytes: 2048,
        chunk_count: 12,
        status: "indexed",
        progress: 1,
        error: null,
      },
    ])
  })

  it("opens with the saved configuration and no pending changes", async () => {
    const wrapper = await mountAt("/app/rag/settings", PRagAgentSettings)
    expect(wrapper.text()).toContain("Edit configuration")
    expect(wrapper.text()).toContain("Support agent · Live")
    expect(wrapper.text()).toContain("policy.docx")
    expect(wrapper.text()).toContain("1 document · 12 chunks")
    expect(
      (
        wrapper.find('input[placeholder="Aura Support Agent"]')
          .element as HTMLInputElement
      ).value
    ).toBe("Support agent")
    expect(wrapper.text()).not.toContain("unsaved change")
    wrapper.unmount()
  })

  it("saves edited fields and channel changes together", async () => {
    const updateAgent = vi
      .spyOn(ragAgentApi, "updateAgent")
      .mockResolvedValue(agent)
    const deleteChannel = vi
      .spyOn(ragAgentApi, "deleteChannel")
      .mockResolvedValue()
    vi.spyOn(ragAgentApi, "getAgentById").mockResolvedValue({
      ...agent,
      name: "Renamed agent",
      channels: [],
    })
    const wrapper = await mountAt("/app/rag/settings", PRagAgentSettings)

    await wrapper
      .find('input[placeholder="Aura Support Agent"]')
      .setValue("Renamed agent")
    await wrapper.find('[aria-label="Connect Web widget"]').trigger("click")
    expect(wrapper.text()).toContain("2 unsaved changes")

    const save = wrapper
      .findAll("button")
      .find((button) => button.text() === "Save changes")
    await save?.trigger("click")
    await flushPromises()

    expect(updateAgent).toHaveBeenCalledWith(
      "business-test",
      agent.id,
      expect.objectContaining({ name: "Renamed agent", status: "live" })
    )
    expect(deleteChannel).toHaveBeenCalledWith("business-test", agent.id, "web")
    expect(wrapper.text()).toContain("Renamed agent · Live")
    expect(wrapper.text()).not.toContain("unsaved change")
    wrapper.unmount()
  })
})

describe("dashboard sidebar", () => {
  it("nests Create agent under the RAG agent and marks it current", async () => {
    const wrapper = await mountAt("/app/rag/create", CDashboardSidebar)
    const createLink = wrapper
      .findAll("a")
      .find((link) => link.text() === "Create agent")
    expect(createLink?.attributes("href")).toBe("/app/rag/create")
    expect(createLink?.attributes("aria-current")).toBe("page")
    wrapper.unmount()
  })
})
