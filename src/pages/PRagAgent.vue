<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useHead } from "@unhead/vue"
import { useRagAgentStore } from "@/entities/rag-agent"
import { formatTimeAgo, usePageHeading, useToast } from "@/shared/lib"
import { CAppButton, CEmptyState } from "@/shared/ui"
import {
  CAgentSummaryCard,
  CAgentSummarySkeleton,
  CConversationsTable,
} from "@/widgets/rag-agent"

useHead({ title: "Universal RAG Agent — Do'ppi AI" })

const store = useRagAgentStore()
const toast = useToast()

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

const load = () => {
  void store.loadAgent({ force: store.agentState === "error" })
  void store.loadConversations({ force: store.conversationsState === "error" })
}

onMounted(load)

// Neither screen exists yet; say so rather than leave a dead button.
const announceSoon = (feature: string) =>
  toast.info(`${feature} is coming soon`, "It ships with the agent API.")
</script>

<template>
  <div class="grid gap-5">
    <CAgentSummarySkeleton v-if="isAgentPending" />

    <template v-else-if="agent">
      <CAgentSummaryCard
        :agent="agent"
        @configure="announceSoon('Editing the configuration')"
        @open-playground="announceSoon('The playground')"
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
