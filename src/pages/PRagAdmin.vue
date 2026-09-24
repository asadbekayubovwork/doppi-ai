<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { useI18n } from "vue-i18n"
import {
  ragAdminApi,
  type AdminModel,
  type AdminTenant,
} from "@/features/rag-admin"
import { messageForProblem } from "@/features/auth"
import { useToast } from "@/shared/lib"
import { CAppButton, CEmptyState, CSelect } from "@/shared/ui"

const TENANT_LIMITS = [
  "max_documents",
  "max_storage_bytes",
  "max_agents",
  "monthly_queries",
  "monthly_tokens",
  "monthly_cost_microusd",
  "max_file_bytes",
  "max_files_per_request",
  "max_pdf_pages",
  "query_rate_per_minute",
  "upload_rate_per_minute",
] as const

const { t } = useI18n()
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
      t("dashboard.rag.admin.unavailable"),
      messageForProblem(error, t("dashboard.rag.admin.accessDenied"))
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
    toast.success(t("dashboard.rag.admin.modelSaved"))
  } catch (error) {
    toast.error(
      t("dashboard.rag.admin.modelFailed"),
      messageForProblem(error, t("dashboard.rag.admin.checkFields"))
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
    toast.success(t("dashboard.rag.admin.tenantSaved"))
  } catch (error) {
    toast.error(
      t("dashboard.rag.admin.tenantFailed"),
      messageForProblem(error, t("dashboard.rag.admin.checkValues"))
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
      :title="$t('dashboard.rag.admin.deniedTitle')"
      :description="$t('dashboard.rag.admin.deniedDescription')"
    />

    <div v-else class="grid gap-5">
      <section class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-[#15151B]">
              {{ $t("dashboard.rag.admin.catalogTitle") }}
            </h2>
            <p class="mt-1 text-xs text-[#84848E]">
              {{ $t("dashboard.rag.admin.catalogDescription") }}
            </p>
          </div>
          <CAppButton icon="circle-plus" @click="editModel()">
            {{ $t("dashboard.rag.admin.newModel") }}
          </CAppButton>
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-[13px]">
            <thead class="bg-[#FAFAF9] text-[11px] uppercase text-[#84848E]">
              <tr>
                <th
                  v-for="column in ['model', 'provider', 'input', 'output', 'state']"
                  :key="column"
                  class="p-3"
                >
                  {{ $t(`dashboard.rag.admin.columns.${column}`) }}
                </th>
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
                  {{
                    model.input_usd_per_million ??
                    $t("dashboard.rag.admin.notSet")
                  }}
                </td>
                <td class="p-3">
                  {{
                    model.output_usd_per_million ??
                    $t("dashboard.rag.admin.notSet")
                  }}
                </td>
                <td class="p-3">
                  {{
                    $t(
                      model.enabled
                        ? "dashboard.rag.admin.enabled"
                        : "dashboard.rag.admin.disabled"
                    )
                  }}{{
                    model.is_default
                      ? ` · ${$t("dashboard.rag.admin.default")}`
                      : ""
                  }}
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
            >{{ $t("dashboard.rag.admin.form.id") }}<input
              v-model.trim="modelForm.id"
              required
              class="control"
          /></label>
          <label class="field"
            >{{ $t("dashboard.rag.admin.form.displayName") }}<input
              v-model.trim="modelForm.display_name"
              required
              class="control"
          /></label>
          <label class="field"
            >{{ $t("dashboard.rag.admin.form.provider") }}<input
              v-model.trim="modelForm.provider"
              required
              class="control"
          /></label>
          <label class="field"
            >{{ $t("dashboard.rag.admin.form.contextTokens") }}<input
              v-model.number="modelForm.context_tokens"
              type="number"
              min="1"
              required
              class="control"
          /></label>
          <label class="field"
            >{{ $t("dashboard.rag.admin.form.input") }}<input
              v-model="modelForm.input_usd_per_million"
              type="number"
              min="0"
              step="0.000001"
              class="control"
          /></label>
          <label class="field"
            >{{ $t("dashboard.rag.admin.form.output") }}<input
              v-model="modelForm.output_usd_per_million"
              type="number"
              min="0"
              step="0.000001"
              class="control"
          /></label>
          <label class="flex items-center gap-2 text-[13px]"
            ><input v-model="modelForm.enabled" type="checkbox" />
            {{ $t("dashboard.rag.admin.enabled") }}</label
          >
          <label class="flex items-center gap-2 text-[13px]"
            ><input v-model="modelForm.is_default" type="checkbox" />
            {{ $t("dashboard.rag.admin.default") }}</label
          >
          <CAppButton variant="primary" type="submit" :loading="saving"
            >{{ $t("dashboard.rag.admin.saveModel") }}</CAppButton
          >
        </form>
      </section>

      <section class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
        <h2 class="text-base font-semibold text-[#15151B]">
          {{ $t("dashboard.rag.admin.tenantTitle") }}
        </h2>
        <div class="mt-4 flex gap-3">
          <CSelect
            v-model="selectedTenantId"
            :options="tenantOptions"
            :aria-label="$t('dashboard.rag.admin.tenant')"
            icon="building-2"
            :placeholder="$t('dashboard.rag.admin.tenantPlaceholder')"
            class="flex-1"
            @change="editTenant"
          />
          <CAppButton @click="editTenant">
            {{ $t("dashboard.rag.admin.loadLimits") }}
          </CAppButton>
        </div>
        <form
          v-if="selectedTenant"
          class="mt-4 grid gap-3 sm:grid-cols-3"
          @submit.prevent="saveTenant"
        >
          <label v-for="key in TENANT_LIMITS" :key="key" class="field">
            {{ $t(`dashboard.rag.admin.limits.${key}`) }}
            <input
              v-model.number="tenantForm[key]"
              type="number"
              min="1"
              class="control"
            />
          </label>
          <div class="flex items-end">
            <CAppButton variant="primary" type="submit" :loading="saving"
              >{{ $t("dashboard.rag.admin.saveTenant") }}</CAppButton
            >
          </div>
        </form>
        <p v-if="loading" class="mt-4 text-sm text-[#84848E]">
          {{ $t("dashboard.rag.admin.loading") }}
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.field {
  @apply grid gap-1.5 text-[12px] text-[#6A6A74];
}
.control {
  @apply rounded-xl border border-[#D8D8D3] bg-white px-3 py-2.5 text-[13px] text-[#15151B] outline-none focus:border-[#5B4BE8];
}
</style>
