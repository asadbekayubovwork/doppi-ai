<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { useAuthStore, messageForProblem } from "@/features/auth"
import { useClaimedPageHeading, useToast } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import type { Business } from "../model/types"
import CBusinessSwitcher from "./CBusinessSwitcher.vue"
import CCreateBusinessModal from "./CCreateBusinessModal.vue"
import CUserMenu from "./CUserMenu.vue"

defineEmits<{ openNav: [] }>()

const route = useRoute()
const auth = useAuthStore()
const toast = useToast()
const isCreateOpen = ref(false)
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

// A page can replace the route's static heading with one built from its data.
const claimedHeading = useClaimedPageHeading()
const title = computed(
  () => claimedHeading.value?.title || route.meta.title || "Ish maydoni"
)
const subtitle = computed(
  () => claimedHeading.value?.subtitle || route.meta.subtitle
)
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
  }
})

onMounted(() => {
  if (auth.status === "unknown") void auth.bootstrap()
})

const selectBusiness = async (id: string) => {
  if (!id || id === auth.activeBusinessId) return
  try {
    await auth.selectBusiness(id)
  } catch (error) {
    toast.error(
      "Biznesni tanlab bo'lmadi",
      messageForProblem(error, "Qayta urinib ko'ring.")
    )
  }
}

const createBusiness = async (payload: {
  name: string
  default_language: string
  billing_region: string
}) => {
  creatingBusiness.value = true
  try {
    await auth.createBusiness(payload)
    isCreateOpen.value = false
    toast.success("Biznes yaratildi", payload.name)
  } catch (error) {
    toast.error(
      "Biznes yaratib bo'lmadi",
      messageForProblem(error, "Ma'lumotlarni tekshirib ko'ring.")
    )
  } finally {
    creatingBusiness.value = false
  }
}

// The store loads the business list on its own (bootstrap, session changes), so
// a failure there is reported from here rather than from each caller.
watch(
  () => auth.businessError,
  (failure) => {
    if (!failure) return
    toast.error(
      "Bizneslar ro'yxatini yuklab bo'lmadi",
      messageForProblem(failure, "Qayta urinib ko'ring."),
      6000
    )
  }
)
</script>

<template>
  <header
    class="relative z-20 flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 border-b border-[#E5E5E1] bg-white px-6 py-3"
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
    <div class="flex items-center gap-2 sm:gap-3">
      <CBusinessSwitcher
        :businesses="businesses"
        :active-id="activeBusinessId"
        @update:active-id="selectBusiness"
        @create="isCreateOpen = true"
      /><span
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
      />
    </div>
    <CCreateBusinessModal
      v-model:open="isCreateOpen"
      :loading="creatingBusiness"
      @create="createBusiness"
    />
  </header>
</template>
