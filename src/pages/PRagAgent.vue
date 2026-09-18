<script setup lang="ts">
import { computed, onMounted, watch } from "vue"
import { useHead } from "@unhead/vue"
import { useRagAgentStore } from "@/entities/rag-agent"
import { useAuthStore } from "@/features/auth"
import { useRouter } from "vue-router"
import { formatTimeAgo, usePageHeading } from "@/shared/lib"
import { CAppButton, CEmptyState } from "@/shared/ui"
import {
  CAgentSummaryCard,
  CAgentSummarySkeleton,
  CConversationsTable,
} from "@/widgets/rag-agent"

useHead({ title: "Universal RAG Agent — Do'ppi AI" })

const store = useRagAgentStore()
const auth = useAuthStore()
const router = useRouter()

const agent = computed(() => store.agent)
const isAgentPending = computed(() =>
  ["idle", "loading"].includes(store.agentState)
)
const areConversationsPending = computed(() =>
  ["idle", "loading"].includes(store.conversationsState)
)

usePageHeading(() => {
  if (!agent.value) return {}
  const { name, status, syncedAt } = agent.value
  const age = formatTimeAgo(syncedAt)
  const synced = age === "now" ? "synced just now" : `synced ${age} ago`
  return { subtitle: `${name} · ${status} · ${synced}` }
})

const businessId = computed(() => auth.activeBusiness?.id ?? "")

const load = async () => {
  if (!businessId.value) return
  await store.loadAgent(businessId.value, {
    force: store.agentState === "error",
  })
  await store.loadConversations(businessId.value, {
    force: store.conversationsState === "error",
  })
}

onMounted(() => void load())
watch(businessId, () => void load())

const openPlayground = () => void router.push({ name: "RagPlayground" })
const openConfiguration = () => void router.push({ name: "RagAgentSettings" })
</script>

<template>
  <div class="grid gap-5">
    <CAgentSummarySkeleton v-if="isAgentPending" />

    <template v-else-if="agent">
      <CAgentSummaryCard
        :agent="agent"
        @configure="openConfiguration"
        @open-playground="openPlayground"
      />
      <CConversationsTable
        :conversations="store.conversations"
        :total="agent.stats.conversations"
        :loading="areConversationsPending"
      />
    </template>

    <CEmptyState
      v-else-if="store.agentState === 'error'"
      icon="triangle-alert"
      title="Couldn't load the agent"
      description="Check your connection and try again."
    >
      <CAppButton icon="refresh-cw" @click="load">Try again</CAppButton>
    </CEmptyState>

    <CEmptyState
      v-else
      icon="bot"
      title="No RAG agent yet"
      description="Each business runs one agent. Give it your documents, pick a model and connect the channels it should answer on."
    >
      <CAppButton
        variant="primary"
        icon="circle-plus"
        :to="{ name: 'RagAgentCreate' }"
      >
        Create agent
      </CAppButton>
    </CEmptyState>
  </div>
</template>
