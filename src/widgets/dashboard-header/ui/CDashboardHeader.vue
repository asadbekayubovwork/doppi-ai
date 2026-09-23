<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { useAuthStore, messageForProblem } from "@/features/auth"
import { useClaimedPageHeading, useToast } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import type { Business } from "../model/types"
import CBusinessSwitcher from "./CBusinessSwitcher.vue"
import CCreateBusinessModal from "./CCreateBusinessModal.vue"
import CUserMenu from "./CUserMenu.vue"

defineEmits<{ openNav: [] }>()

const { t } = useI18n()
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
  plan: business.role || t("dashboard.header.fallbackPlan"),
})

// A page can replace the route's static heading with one built from its data.
const claimedHeading = useClaimedPageHeading()
const routeHeading = computed(() => {
  const key = route.meta.heading
  if (!key) return null
  return {
    title: t(`dashboard.routes.${key}.title`),
    subtitle: t(`dashboard.routes.${key}.subtitle`),
  }
})
const title = computed(
  () =>
    claimedHeading.value?.title ||
    routeHeading.value?.title ||
    t("dashboard.header.fallbackTitle")
)
const subtitle = computed(
  () => claimedHeading.value?.subtitle || routeHeading.value?.subtitle
)
const businesses = computed(() => auth.businesses.map(toViewBusiness))
const activeBusinessId = computed({
  get: () => auth.activeBusinessId || businesses.value[0]?.id || "",
  set: (id: string) => void selectBusiness(id),
})
const user = computed(() => {
  const first = auth.user?.first_name || ""
  const last = auth.user?.last_name || ""
  const name =
    `${first} ${last}`.trim() ||
    auth.user?.email ||
    t("dashboard.header.fallbackUser")
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
      t("dashboard.header.businessSelectFailed"),
      messageForProblem(error, t("dashboard.common.retry"))
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
    toast.success(t("dashboard.header.businessCreated"), payload.name)
  } catch (error) {
    toast.error(
      t("dashboard.header.businessCreateFailed"),
      messageForProblem(error, t("dashboard.common.checkDetails"))
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
      t("dashboard.header.businessListFailed"),
      messageForProblem(failure, t("dashboard.common.retry")),
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
      :aria-label="$t('dashboard.header.openMenu')"
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
        :aria-label="$t('dashboard.header.notifications')"
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
