<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { useHead } from "@unhead/vue"
import { useRouter } from "vue-router"
import { ragAgentApi, useRagAgentStore } from "@/entities/rag-agent"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { useToast } from "@/shared/lib"
import { CAppButton, CEmptyState } from "@/shared/ui"

useHead({ title: "RAG agent settings — Do'ppi AI" })

const auth = useAuthStore()
const store = useRagAgentStore()
const router = useRouter()
const toast = useToast()
const businessId = computed(() => auth.activeBusiness?.id ?? "")
const saving = ref(false)
const deleting = ref(false)
const form = reactive({
  name: "",
  description: "",
  status: "live" as "live" | "paused",
  model: "",
  temperature: 0.2,
  systemPrompt: "",
  topK: 8,
  similarityThreshold: 0.1,
})

const load = async () => {
  if (!businessId.value) return
  await Promise.all([
    store.loadAgent(businessId.value),
    store.loadConfiguration(businessId.value),
  ])
  const agent = store.agent
  if (!agent) return
  Object.assign(form, {
    name: agent.name,
    description: agent.description,
    status: agent.status,
    model: agent.model,
    temperature: agent.temperature,
    systemPrompt: agent.systemPrompt,
    topK: agent.topK,
    similarityThreshold: agent.similarityThreshold,
  })
}

onMounted(() => void load())

const save = async () => {
  if (!store.agent || !businessId.value) return
  saving.value = true
  try {
    store.agent = await ragAgentApi.updateAgent(
      businessId.value,
      store.agent.id,
      form
    )
    toast.success("Agent updated", "Changes are active for new requests.")
  } catch (error) {
    toast.error("Update failed", messageForProblem(error, "Try again."))
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  if (!store.agent || !businessId.value) return
  if (!window.confirm("Delete this agent and all of its conversations?")) return
  deleting.value = true
  try {
    await ragAgentApi.deleteAgent(businessId.value, store.agent.id)
    store.$reset()
    await router.replace({ name: "RagAgent" })
    toast.success("Agent deleted")
  } catch (error) {
    toast.error("Delete failed", messageForProblem(error, "Try again."))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <main>
    <CEmptyState
      v-if="store.agentState === 'ready' && !store.agent"
      icon="bot"
      title="No agent to configure"
      description="Create an agent before opening its configuration."
    >
      <CAppButton variant="primary" :to="{ name: 'RagAgentCreate' }"
        >Create agent</CAppButton
      >
    </CEmptyState>

    <form
      v-else
      class="mx-auto grid w-full max-w-4xl gap-5"
      @submit.prevent="save"
    >
      <section
        class="grid gap-4 rounded-2xl border border-[#E5E5E1] bg-white p-5 sm:grid-cols-2"
      >
        <label class="grid gap-1.5 text-[13px] text-[#6A6A74]">
          Agent name
          <input
            v-model.trim="form.name"
            required
            maxlength="160"
            class="control"
          />
        </label>
        <label class="grid gap-1.5 text-[13px] text-[#6A6A74]">
          Status
          <select v-model="form.status" class="control">
            <option value="live">Live</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <label class="grid gap-1.5 text-[13px] text-[#6A6A74] sm:col-span-2">
          Description
          <textarea
            v-model="form.description"
            maxlength="1000"
            rows="2"
            class="control"
          />
        </label>
      </section>

      <section
        class="grid gap-4 rounded-2xl border border-[#E5E5E1] bg-white p-5 sm:grid-cols-2"
      >
        <label class="grid gap-1.5 text-[13px] text-[#6A6A74]">
          Model
          <select v-model="form.model" required class="control">
            <option
              v-for="model in store.models"
              :key="model.id"
              :value="model.id"
            >
              {{ model.displayName }} · {{ model.provider }}
            </option>
          </select>
        </label>
        <label class="grid gap-1.5 text-[13px] text-[#6A6A74]">
          Temperature · {{ form.temperature.toFixed(1) }}
          <input
            v-model.number="form.temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            class="mt-2 accent-[#5B4BE8]"
          />
        </label>
        <label class="grid gap-1.5 text-[13px] text-[#6A6A74]">
          Retrieved chunks
          <input
            v-model.number="form.topK"
            type="number"
            min="1"
            max="32"
            class="control"
          />
        </label>
        <label class="grid gap-1.5 text-[13px] text-[#6A6A74]">
          Similarity threshold
          <input
            v-model.number="form.similarityThreshold"
            type="number"
            min="-1"
            max="1"
            step="0.05"
            class="control"
          />
        </label>
        <label class="grid gap-1.5 text-[13px] text-[#6A6A74] sm:col-span-2">
          System prompt
          <textarea
            v-model="form.systemPrompt"
            maxlength="20000"
            rows="8"
            class="control font-mono text-xs"
          />
        </label>
      </section>

      <div class="flex flex-wrap justify-between gap-3">
        <CAppButton
          class="text-[#C42B2B]"
          :loading="deleting"
          type="button"
          @click="remove"
        >
          Delete agent
        </CAppButton>
        <div class="flex gap-2">
          <CAppButton :to="{ name: 'RagAgent' }">Cancel</CAppButton>
          <CAppButton variant="primary" :loading="saving" type="submit"
            >Save changes</CAppButton
          >
        </div>
      </div>
    </form>
  </main>
</template>

<style scoped>
.control {
  @apply rounded-xl border border-[#D8D8D3] px-3.5 py-2.5 text-[#15151B] outline-none focus:border-[#5B4BE8];
}
</style>
