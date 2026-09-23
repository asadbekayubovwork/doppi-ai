<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { useHead } from "@unhead/vue"
import {
  ragAdminApi,
  type AdminModel,
  type AdminTenant,
} from "@/features/rag-admin"
import { messageForProblem } from "@/features/auth"
import { useToast } from "@/shared/lib"
import { CAppButton, CEmptyState, CSelect } from "@/shared/ui"

useHead({ title: "RAG administration — Do'ppi AI" })

const toast = useToast()
const loading = ref(true)
const denied = ref(false)
const saving = ref(false)
const models = ref<AdminModel[]>([])
const tenants = ref<AdminTenant[]>([])
const selectedTenantId = ref("")
const emptyModel = (): AdminModel => ({
  id: "",
  display_name: "",
  provider: "",
  context_tokens: 32768,
  input_usd_per_million: null,
  output_usd_per_million: null,
  currency: "USD",
  enabled: true,
  is_default: false,
  capabilities: { chat: true },
  sort_order: 100,
})
const modelForm = reactive(emptyModel())
const tenantForm = reactive<Partial<AdminTenant>>({})

const selectedTenant = computed(() =>
  tenants.value.find((tenant) => tenant.business_id === selectedTenantId.value)
)

const load = async () => {
  loading.value = true
  try {
    ;[models.value, tenants.value] = await Promise.all([
      ragAdminApi.listModels(),
      ragAdminApi.listTenants(),
    ])
    if (!selectedTenantId.value)
      selectedTenantId.value = tenants.value[0]?.business_id ?? ""
    denied.value = false
  } catch (error) {
    denied.value = true
    toast.error(
      "Admin data unavailable",
      messageForProblem(error, "Access denied.")
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())

const editModel = (model?: AdminModel) =>
  Object.assign(modelForm, model ?? emptyModel())
const tenantOptions = computed(() =>
  tenants.value.map((tenant) => ({
    value: tenant.business_id,
    label: tenant.tenant_name,
    hint: tenant.business_id,
  }))
)
const editTenant = () => Object.assign(tenantForm, selectedTenant.value ?? {})

const saveModel = async () => {
  saving.value = true
  try {
    const payload = {
      ...modelForm,
      input_usd_per_million: modelForm.input_usd_per_million || null,
      output_usd_per_million: modelForm.output_usd_per_million || null,
    }
    await ragAdminApi.saveModel(payload)
    await load()
    toast.success("Model catalog updated")
  } catch (error) {
    toast.error(
      "Model was not saved",
      messageForProblem(error, "Check the fields.")
    )
  } finally {
    saving.value = false
  }
}

const saveTenant = async () => {
  if (!selectedTenantId.value) return
  saving.value = true
  try {
    const excluded = new Set(["business_id", "tenant_name"])
    const payload = Object.fromEntries(
      Object.entries(tenantForm).filter(([key]) => !excluded.has(key))
    )
    await ragAdminApi.updateTenant(selectedTenantId.value, payload)
    await load()
    toast.success("Tenant limits updated")
  } catch (error) {
    toast.error(
      "Limits were not saved",
      messageForProblem(error, "Check the values.")
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main>
    <CEmptyState
      v-if="denied"
      icon="lock"
      title="Platform administrator access required"
      description="This area is restricted by the control-plane admin allowlist."
    />

    <div v-else class="grid gap-5">
      <section class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-[#15151B]">
              Dynamic model catalog
            </h2>
            <p class="mt-1 text-xs text-[#84848E]">
              Frontend options and exact prices come from this catalog.
            </p>
          </div>
          <CAppButton icon="circle-plus" @click="editModel()"
            >New model</CAppButton
          >
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-[13px]">
            <thead class="bg-[#FAFAF9] text-[11px] uppercase text-[#84848E]">
              <tr>
                <th class="p-3">Model</th>
                <th class="p-3">Provider</th>
                <th class="p-3">Input / 1M</th>
                <th class="p-3">Output / 1M</th>
                <th class="p-3">State</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EEEEEA]">
              <tr
                v-for="model in models"
                :key="model.id"
                class="cursor-pointer hover:bg-[#FAFAF9]"
                @click="editModel(model)"
              >
                <td class="p-3 font-medium text-[#15151B]">
                  {{ model.display_name }}<br /><span
                    class="text-[11px] font-normal text-[#84848E]"
                    >{{ model.id }}</span
                  >
                </td>
                <td class="p-3">{{ model.provider }}</td>
                <td class="p-3">
                  {{ model.input_usd_per_million ?? "Not set" }}
                </td>
                <td class="p-3">
                  {{ model.output_usd_per_million ?? "Not set" }}
                </td>
                <td class="p-3">
                  {{ model.enabled ? "Enabled" : "Disabled"
                  }}{{ model.is_default ? " · Default" : "" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <form
          class="mt-5 grid gap-3 border-t border-[#EEEEEA] pt-5 sm:grid-cols-3"
          @submit.prevent="saveModel"
        >
          <label class="field"
            >Model ID<input
              v-model.trim="modelForm.id"
              required
              class="control"
          /></label>
          <label class="field"
            >Display name<input
              v-model.trim="modelForm.display_name"
              required
              class="control"
          /></label>
          <label class="field"
            >Provider<input
              v-model.trim="modelForm.provider"
              required
              class="control"
          /></label>
          <label class="field"
            >Context tokens<input
              v-model.number="modelForm.context_tokens"
              type="number"
              min="1"
              required
              class="control"
          /></label>
          <label class="field"
            >Input USD / 1M<input
              v-model="modelForm.input_usd_per_million"
              type="number"
              min="0"
              step="0.000001"
              class="control"
          /></label>
          <label class="field"
            >Output USD / 1M<input
              v-model="modelForm.output_usd_per_million"
              type="number"
              min="0"
              step="0.000001"
              class="control"
          /></label>
          <label class="flex items-center gap-2 text-[13px]"
            ><input v-model="modelForm.enabled" type="checkbox" />
            Enabled</label
          >
          <label class="flex items-center gap-2 text-[13px]"
            ><input v-model="modelForm.is_default" type="checkbox" />
            Default</label
          >
          <CAppButton variant="primary" type="submit" :loading="saving"
            >Save model</CAppButton
          >
        </form>
      </section>

      <section class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
        <h2 class="text-base font-semibold text-[#15151B]">Tenant limits</h2>
        <div class="mt-4 flex gap-3">
          <CSelect
            v-model="selectedTenantId"
            :options="tenantOptions"
            aria-label="Tenant"
            icon="building-2"
            placeholder="Tenant tanlang"
            class="flex-1"
            @change="editTenant"
          />
          <CAppButton @click="editTenant">Load limits</CAppButton>
        </div>
        <form
          v-if="selectedTenant"
          class="mt-4 grid gap-3 sm:grid-cols-3"
          @submit.prevent="saveTenant"
        >
          <label
            v-for="key in [
              'max_documents',
              'max_storage_bytes',
              'max_agents',
              'monthly_queries',
              'monthly_tokens',
              'monthly_cost_microusd',
              'max_file_bytes',
              'max_files_per_request',
              'max_pdf_pages',
              'query_rate_per_minute',
              'upload_rate_per_minute',
            ]"
            :key="key"
            class="field"
          >
            {{ key.replaceAll("_", " ") }}
            <input
              v-model.number="tenantForm[key as keyof AdminTenant]"
              type="number"
              min="1"
              class="control"
            />
          </label>
          <div class="flex items-end">
            <CAppButton variant="primary" type="submit" :loading="saving"
              >Save tenant limits</CAppButton
            >
          </div>
        </form>
        <p v-if="loading" class="mt-4 text-sm text-[#84848E]">
          Loading configuration…
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.field {
  @apply grid gap-1.5 text-[12px] capitalize text-[#6A6A74];
}
.control {
  @apply rounded-xl border border-[#D8D8D3] bg-white px-3 py-2.5 text-[13px] text-[#15151B] outline-none focus:border-[#5B4BE8];
}
</style>
