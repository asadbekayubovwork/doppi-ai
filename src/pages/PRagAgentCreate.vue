<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useHead } from "@unhead/vue"
import { useRouter } from "vue-router"
import { messageForProblem, useAuthStore } from "@/features/auth"
import {
  ACCEPTED_EXTENSIONS,
  CAgentIdentitySection,
  CChannelsSection,
  CKnowledgeBaseSection,
  CLlmModelSection,
  CSetupChecklist,
  CSystemPromptSection,
  PROMPT_TOKEN_LIMIT,
  buildPromptTemplate,
  useAgentSetupForm,
} from "@/features/rag-agent-setup"
import { useRagAgentStore } from "@/entities/rag-agent"
import { usePageHeading, useToast } from "@/shared/lib"
import { CAppButton, CBadge } from "@/shared/ui"

useHead({ title: "Create RAG agent — Do'ppi AI" })

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const store = useRagAgentStore()
const form = useAgentSetupForm()
const isSubmitting = ref(false)

onMounted(() => void store.loadAgent())

usePageHeading(() => ({
  subtitle: store.agent
    ? `Replaces ${store.agent.name}`
    : "No agent yet · create the one agent for this business",
}))

const addFiles = (files: File[]) => {
  const rejected = form.addFiles(files)
  if (!rejected.length) return
  toast.warning(
    rejected.length === 1
      ? "1 file skipped"
      : `${rejected.length} files skipped`,
    rejected.map(({ file, reason }) => `${file.name} — ${reason}`).join("\n")
  )
}

const applyTemplate = () => {
  const hasPrompt = form.systemPrompt.trim().length > 0
  if (
    hasPrompt &&
    !window.confirm("Replace the current prompt with the template?")
  ) {
    return
  }
  form.systemPrompt = buildPromptTemplate({
    agentName: form.name.trim(),
    businessName: auth.activeBusiness?.name,
  })
}

const submit = async () => {
  if (!form.canSubmit) {
    toast.warning(
      "Finish the setup first",
      form.missing.map((item) => item.label).join(", ")
    )
    return
  }
  isSubmitting.value = true
  try {
    const agent = await store.createAgent(form.toPayload())
    toast.success("Agent created", `${agent.name} is live.`)
    await router.push({ name: "RagAgent" })
  } catch (error) {
    toast.error(
      "Couldn't create the agent",
      messageForProblem(error, "Try again in a moment.")
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="grid gap-5">
    <header
      class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    >
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2.5">
          <h2 class="text-xl font-semibold tracking-tight text-[#15151B]">
            Create your RAG agent
          </h2>
          <CBadge tone="outline" icon="lock">One agent per business</CBadge>
        </div>
        <p class="mt-1 text-[13.5px] text-[#6A6A74]">
          Name it, feed it documents, pick a model, write the system prompt and
          connect the channels it will answer on.
        </p>
      </div>
      <div class="flex shrink-0 gap-2.5">
        <CAppButton :to="{ name: 'RagAgent' }">Cancel</CAppButton>
        <CAppButton
          variant="primary"
          icon="check"
          :loading="isSubmitting"
          @click="submit"
        >
          Create agent
        </CAppButton>
      </div>
    </header>

    <div
      class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]"
    >
      <div class="grid gap-5">
        <CAgentIdentitySection
          v-model:name="form.name"
          v-model:description="form.description"
        />
        <CKnowledgeBaseSection
          :documents="form.documents"
          :accept="ACCEPTED_EXTENSIONS.join(',')"
          @add="addFiles"
          @remove="form.removeDocument"
        />
        <CLlmModelSection
          v-model:model="form.model"
          v-model:temperature="form.temperature"
        />
        <CSystemPromptSection
          v-model="form.systemPrompt"
          :tokens="form.promptTokens"
          :limit="PROMPT_TOKEN_LIMIT"
          @use-template="applyTemplate"
        />
      </div>

      <div class="grid gap-5">
        <CChannelsSection
          :channels="form.channels"
          :available="form.availableChannels"
          @toggle="form.setChannelEnabled"
          @credential="form.setCredential"
          @add="form.addChannel"
        />
        <CSetupChecklist :items="form.checklist" />
      </div>
    </div>
  </div>
</template>
