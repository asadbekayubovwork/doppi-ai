<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
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
import { useCountLabel, usePageHeading, useToast } from "@/shared/lib"
import { CAppButton, CBadge } from "@/shared/ui"

const { t } = useI18n()
const count = useCountLabel()
const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const store = useRagAgentStore()
const businessId = computed(() => auth.activeBusiness?.id ?? "")
const form = useAgentSetupForm(() => businessId.value)
const isSubmitting = ref(false)

const load = async () => {
  if (!businessId.value) return
  try {
    await Promise.all([
      store.loadAgent(businessId.value),
      store.loadConfiguration(businessId.value),
    ])
    if (store.limits) form.configureLimits(store.limits.max_file_bytes)
    if (!form.model && store.models.length) {
      form.model =
        store.models.find((model) => model.isDefault)?.id ?? store.models[0].id
    }
  } catch (error) {
    toast.error(
      t("dashboard.rag.loadConfigFailed"),
      messageForProblem(error, t("dashboard.common.tryLater"))
    )
  }
}

onMounted(() => void load())
watch(businessId, () => void load())

usePageHeading(() => ({
  subtitle: store.agent
    ? t("dashboard.rag.create.replaces", { name: store.agent.name })
    : t("dashboard.rag.create.noAgentYet"),
}))

const addFiles = (files: File[]) => {
  const rejected = form.addFiles(files)
  if (!rejected.length) return
  toast.warning(
    count("dashboard.plural.filesSkipped", rejected.length),
    rejected
      .map(({ file, reason }) =>
        t("dashboard.rag.fileSkipped", { name: file.name, reason: t(reason) })
      )
      .join("\n")
  )
}

const applyTemplate = () => {
  const hasPrompt = form.systemPrompt.trim().length > 0
  if (
    hasPrompt &&
    !window.confirm(t("dashboard.rag.prompt.replaceConfirm"))
  ) {
    return
  }
  form.systemPrompt = buildPromptTemplate(
    {
      agentName: form.name.trim(),
      businessName: auth.activeBusiness?.name,
    },
    t
  )
}

const submit = async () => {
  if (!form.canSubmit) {
    toast.warning(
      t("dashboard.rag.create.finishSetup"),
      form.missing.map((item) => t(item.label)).join(", ")
    )
    return
  }
  isSubmitting.value = true
  try {
    const agent = await store.createAgent(businessId.value, form.toPayload())
    toast.success(
      t("dashboard.rag.create.created"),
      t("dashboard.rag.create.createdDetail", { name: agent.name })
    )
    await router.push({ name: "RagAgent" })
  } catch (error) {
    toast.error(
      t("dashboard.rag.create.createFailed"),
      messageForProblem(error, t("dashboard.common.tryLater"))
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="grid grid-cols-1 gap-5">
    <header
      class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    >
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2.5">
          <h2 class="text-xl font-semibold tracking-tight text-[#15151B]">
            {{ $t("dashboard.rag.create.title") }}
          </h2>
          <CBadge tone="outline" icon="lock">
            {{ $t("dashboard.rag.onePerBusiness") }}
          </CBadge>
        </div>
        <p class="mt-1 text-[13.5px] text-[#6A6A74]">
          {{ $t("dashboard.rag.create.description") }}
        </p>
      </div>
      <div class="flex shrink-0 gap-2.5">
        <CAppButton :to="{ name: 'RagAgent' }">
          {{ $t("dashboard.common.cancel") }}
        </CAppButton>
        <CAppButton
          variant="primary"
          icon="check"
          :loading="isSubmitting"
          @click="submit"
        >
          {{ $t("dashboard.rag.createAgent") }}
        </CAppButton>
      </div>
    </header>

    <div
      class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]"
    >
      <div class="grid grid-cols-1 gap-5">
        <CAgentIdentitySection
          v-model:name="form.name"
          v-model:description="form.description"
        />
        <CKnowledgeBaseSection
          :documents="form.documents"
          :accept="ACCEPTED_EXTENSIONS.join(',')"
          :max-file-bytes="form.maxFileBytes"
          @add="addFiles"
          @remove="form.removeDocument"
        />
        <CLlmModelSection
          v-model:model="form.model"
          v-model:temperature="form.temperature"
          :models="store.models"
          :loading="store.configurationState === 'loading'"
        />
        <CSystemPromptSection
          v-model="form.systemPrompt"
          :tokens="form.promptTokens"
          :limit="PROMPT_TOKEN_LIMIT"
          @use-template="applyTemplate"
        />
      </div>

      <div class="grid grid-cols-1 gap-5">
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
