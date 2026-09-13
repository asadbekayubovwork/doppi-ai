<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { useAuthStore, messageForProblem } from "@/features/auth"
import { CIcon } from "@/shared/ui"
import type { Business } from "../model/types"
import CBusinessSwitcher from "./CBusinessSwitcher.vue"
import CCreateBusinessModal from "./CCreateBusinessModal.vue"
import CUserMenu from "./CUserMenu.vue"

defineEmits<{ openNav: [] }>()

const route = useRoute()
const auth = useAuthStore()
const isCreateOpen = ref(false)
const businessError = ref("")
const creatingBusiness = ref(false)

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "??"

const toViewBusiness = (
  business: (typeof auth.businesses)[number]
): Business => ({
  ...business,
  initials: initialsFor(business.name),
  plan: business.role || "Workspace",
})

const title = computed(() => route.meta.title || "Ish maydoni")
const subtitle = computed(() => route.meta.subtitle)
const businesses = computed(() => auth.businesses.map(toViewBusiness))
const activeBusinessId = computed({
  get: () => auth.activeBusinessId || businesses.value[0]?.id || "",
  set: (id: string) => void selectBusiness(id),
})
const user = computed(() => {
  const first = auth.user?.first_name || ""
  const last = auth.user?.last_name || ""
  const name = `${first} ${last}`.trim() || auth.user?.email || "Foydalanuvchi"
  return {
    name,
    email: auth.user?.email || "",
    initials: initialsFor(name),
    balance: "",
    notifications: 0,
  }
})

onMounted(() => {
  if (auth.status === "unknown") void auth.bootstrap()
})

const selectBusiness = async (id: string) => {
  if (!id || id === auth.activeBusinessId) return
  businessError.value = ""
  try {
    await auth.selectBusiness(id)
  } catch (error) {
    businessError.value = messageForProblem(error, "Biznesni tanlab bo'lmadi.")
  }
}

const createBusiness = async (payload: {
  name: string
  default_language: string
  billing_region: string
}) => {
  businessError.value = ""
  creatingBusiness.value = true
  try {
    await auth.createBusiness(payload)
    isCreateOpen.value = false
  } catch (error) {
    businessError.value = messageForProblem(error, "Biznes yaratib bo'lmadi.")
  } finally {
    creatingBusiness.value = false
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 border-b border-[#E5E5E1] bg-white px-6 py-3"
  >
    <button
      type="button"
      class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6A6A74] hover:bg-[#FAFAF9] lg:hidden"
      aria-label="Menyuni ochish"
      @click="$emit('openNav')"
    >
      <CIcon name="menu" class="h-5 w-5" />
    </button>
    <div class="min-w-0 flex-1">
      <h1 class="truncate text-base font-semibold text-[#15151B]">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="truncate text-[11.5px] text-[#84848E]">
        {{ subtitle }}
      </p>
    </div>
    <label class="relative hidden min-w-0 max-w-[240px] flex-1 xl:block"
      ><span class="sr-only">Qidiruv</span
      ><CIcon
        name="search"
        class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84848E]" /><input
        type="search"
        placeholder="Qidirish"
        class="h-9 w-full rounded-[9px] border border-[#E5E5E1] bg-[#FAFAF9] pl-10 pr-3 text-sm outline-none focus:border-[#5B4BE8] focus:bg-white"
    /></label>
    <div class="flex items-center gap-2 sm:gap-3">
      <CBusinessSwitcher
        :businesses="businesses"
        :active-id="activeBusinessId"
        @update:active-id="selectBusiness"
        @create="isCreateOpen = true"
      /><button
        type="button"
        class="hidden h-9 items-center gap-2 rounded-[9px] border border-[#E5E5E1] bg-white px-3 text-sm font-semibold text-[#15151B] hover:bg-[#FAFAF9] md:inline-flex"
        @click="isCreateOpen = true"
      >
        <CIcon name="plus" class="h-4 w-4" />Yangi biznes</button
      ><span
        class="hidden h-6 w-px bg-[#E5E5E1] sm:block"
        aria-hidden="true"
      /><button
        type="button"
        class="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6A6A74] hover:bg-[#FAFAF9]"
        aria-label="Bildirishnomalar"
      >
        <CIcon name="bell" class="h-5 w-5" /></button
      ><CUserMenu
        :name="user.name"
        :email="user.email"
        :initials="user.initials"
        :balance="user.balance"
        :notifications="user.notifications"
      />
    </div>
    <p
      v-if="businessError || auth.businessError"
      class="basis-full text-right text-xs text-[#C42B2B]"
      role="alert"
    >
      {{ businessError || "Bizneslar ro'yxatini yuklab bo'lmadi." }}
      <button
        v-if="auth.businessError"
        class="ml-2 underline"
        @click="auth.loadBusinesses()"
      >
        Qayta urinish
      </button>
    </p>
    <CCreateBusinessModal
      v-model:open="isCreateOpen"
      :loading="creatingBusiness"
      :error-message="businessError"
      @create="createBusiness"
    />
  </header>
</template>
