<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { CIcon, CSelect } from "@/shared/ui"

// Language names stay in their own language, whatever the interface speaks.
const LANGUAGE_OPTIONS = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
]
const REGIONS = ["UZ", "KZ", "US", "EU"]

const { t } = useI18n()
const regionOptions = computed(() =>
  REGIONS.map((value) => ({
    value,
    label: t(`dashboard.businessModal.regions.${value}`),
  }))
)

const props = defineProps<{
  open: boolean
  loading?: boolean
}>()
const emit = defineEmits<{
  "update:open": [value: boolean]
  create: [
    payload: { name: string; default_language: string; billing_region: string },
  ]
}>()

const name = ref("")
const language = ref("uz")
const region = ref("UZ")
const close = () => {
  if (!props.loading) emit("update:open", false)
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = ""
    language.value = "uz"
    region.value = "UZ"
  }
)

const submit = () => {
  emit("create", {
    name: name.value.trim(),
    default_language: language.value,
    billing_region: region.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0F0F17]/45 p-4 backdrop-blur-[2px]"
        @click.self="close"
        @keydown.esc="close"
      >
        <div
          class="modal-panel w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(16,17,26,0.24)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-business-title"
        >
          <div class="flex items-start gap-4 border-b border-[#E9E9EF] p-5">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EFEAFE] text-[#6633EE]"
              ><CIcon name="building-2" class="h-5 w-5"
            /></span>
            <div class="min-w-0 flex-1">
              <h2
                id="create-business-title"
                class="text-[19px] font-bold tracking-tight text-[#0F0F17]"
              >
                {{ $t("dashboard.businessModal.title") }}
              </h2>
              <p class="mt-1 text-[13.5px] leading-5 text-[#6B6B78]">
                {{ $t("dashboard.businessModal.description") }}
              </p>
            </div>
            <button
              type="button"
              :disabled="loading"
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E4E4EB] text-[#8E8E9C] hover:bg-[#F7F7F9]"
              :aria-label="$t('dashboard.businessModal.close')"
              @click="close"
            >
              <CIcon name="x" class="h-4 w-4" />
            </button>
          </div>

          <form
            id="create-business-form"
            class="grid gap-4 p-5"
            @submit.prevent="submit"
          >
            <label class="grid gap-1.5 text-[13.5px] font-medium text-[#3D3D4A]"
              >{{ $t("dashboard.businessModal.name") }}<input
                v-model="name"
                required
                minlength="2"
                maxlength="160"
                autofocus
                placeholder="Karimov Group"
                class="h-12 rounded-xl border border-[#E1E1E9] px-4 text-[14.5px] outline-none focus:border-[#6633EE]"
            /></label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label
                class="grid gap-1.5 text-[13.5px] font-medium text-[#3D3D4A]"
                >{{ $t("dashboard.businessModal.language") }}<CSelect
                  v-model="language"
                  :options="LANGUAGE_OPTIONS"
                  icon="languages"
                  size="xl"
              /></label>
              <label
                class="grid gap-1.5 text-[13.5px] font-medium text-[#3D3D4A]"
                >{{ $t("dashboard.businessModal.region") }}<CSelect
                  v-model="region"
                  :options="regionOptions"
                  icon="globe"
                  size="xl"
              /></label>
            </div>
            <p
              class="rounded-xl bg-[#F3F0FE] px-3.5 py-3 text-[13.5px] leading-5 text-[#4B21C4]"
            >
              {{ $t("dashboard.businessModal.note") }}
            </p>
          </form>

          <div
            class="flex justify-end gap-3 border-t border-[#E9E9EF] bg-[#FBFBFC] px-5 py-4"
          >
            <button
              type="button"
              :disabled="loading"
              class="h-11 rounded-xl border border-[#E3E3EB] bg-white px-4 text-sm font-semibold"
              @click="close"
            >
              {{ $t("dashboard.businessModal.cancel") }}
            </button>
            <button
              type="submit"
              form="create-business-form"
              :disabled="loading"
              class="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6633EE] px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              <CIcon name="plus" class="h-4 w-4" />{{
                loading
                  ? $t("dashboard.businessModal.submitting")
                  : $t("dashboard.businessModal.submit")
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
