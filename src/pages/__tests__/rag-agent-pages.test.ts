import { flushPromises, mount } from "@vue/test-utils"
import { createPinia } from "pinia"
import { createHead } from "@unhead/vue/client"
import { createRouter, createMemoryHistory } from "vue-router"
import { CDashboardSidebar } from "@/widgets/dashboard-sidebar"
import PRagAgent from "../PRagAgent.vue"
import PRagAgentCreate from "../PRagAgentCreate.vue"
import PRagConversation from "../PRagConversation.vue"

const stub = { template: "<div />" }

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
      {
        path: "/app/rag/conversations/:chatId",
        name: "RagConversation",
        component: stub,
      },
      { path: "/:pathMatch(.*)*", component: stub },
    ],
  })
  await router.push(path)
  const wrapper = mount(component as never, {
    props,
    global: { plugins: [createPinia(), router, createHead()] },
  })
  // The RAG API is an in-memory stand-in that answers after a short delay.
  await vi.runAllTimersAsync()
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.useFakeTimers()
  // jsdom has no layout; the conversation list scrolls the open chat into view.
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("RAG agent pages", () => {
  it("renders the agent summary and the first page of conversations", async () => {
    const wrapper = await mountAt("/app/rag", PRagAgent)
    const text = wrapper.text()

    expect(text).toContain("Aura Support Agent")
    expect(text).toContain("8,942")
    expect(text).toContain("GPT-4o · temperature 0.3")
    expect(wrapper.findAll("tbody tr")).toHaveLength(10)
    expect(text).toContain("Showing 1–10 of 20 conversations")
    wrapper.unmount()
  })

  it("opens a conversation with its transcript, sources and outcome", async () => {
    const wrapper = await mountAt(
      "/app/rag/conversations/chat_5c73aa90",
      PRagConversation,
      { chatId: "chat_5c73aa90" }
    )
    const text = wrapper.text()

    expect(text).toContain("Madina Karimova")
    expect(text).toContain("Ulgurji buyurtmaga chegirma bormi?")
    expect(text).toContain("Pricing & discounts.xlsx · sheet 3")
    expect(text).toContain("Retrieved sources")
    expect(text).toContain("Customer rated 5/5")
    expect(text).toContain("Read-only transcript — take over to reply")
    wrapper.unmount()
  })

  it("says so when a conversation does not exist", async () => {
    const wrapper = await mountAt(
      "/app/rag/conversations/chat_missing",
      PRagConversation,
      { chatId: "chat_missing" }
    )

    expect(wrapper.text()).toContain("Conversation not found")
    wrapper.unmount()
  })

  it("renders every setup step and the checklist", async () => {
    const wrapper = await mountAt("/app/rag/create", PRagAgentCreate)
    const text = wrapper.text()

    for (const step of [
      "Agent name",
      "Knowledge base",
      "LLM model",
      "System prompt",
      "Channels & credentials",
      "Setup checklist",
    ]) {
      expect(text).toContain(step)
    }
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3)
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

    const toggle = wrapper.find(
      'button[aria-label="Collapse Universal RAG Agent"]'
    )
    expect(toggle.attributes("aria-expanded")).toBe("true")

    await toggle.trigger("click")
    await vi.runAllTimersAsync()
    expect(wrapper.text()).not.toContain("Create agent")
    wrapper.unmount()
  })
})
