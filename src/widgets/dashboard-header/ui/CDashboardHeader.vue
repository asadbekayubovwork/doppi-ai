<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import { CIcon } from "@/shared/ui"
import type { Business } from "../model/types"
import CBusinessSwitcher from "./CBusinessSwitcher.vue"
import CCreateBusinessModal from "./CCreateBusinessModal.vue"
import CUserMenu from "./CUserMenu.vue"

defineEmits<{ openNav: [] }>()

const route = useRoute()

// Each dashboard route carries its own heading, so the pages stay presentational.
const title = computed(() => route.meta.title || "Ish maydoni")
const subtitle = computed(() => route.meta.subtitle)

// Placeholder workspace data until the businesses endpoint is wired up.
const businesses = ref<Business[]>([
  { id: "kg", name: "Karimov Group", initials: "KG", plan: "Pro", members: 3 },
  {
    id: "sr",
    name: "Silk Road Logistics",
    initials: "SR",
    plan: "Starter",
    members: 1,
  },
  { id: "nl", name: "Nova Labs", initials: "NL", plan: "Trial", members: 5 },
])
const activeBusinessId = ref("kg")
const activeBusiness = computed(
  () =>
    businesses.value.find((item) => item.id === activeBusinessId.value) ??
    businesses.value[0]
)

const user = {
  name: "Akmal Karimov",
  email: "akmal@doppi.ai",
  initials: "AK",
  balance: "$248.60",
  notifications: 4,
}

const isCreateOpen = ref(false)

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "??"

// Local-only until the API exists: the new business shows up and becomes
// active, but nothing is persisted yet.
const createBusiness = (payload: { name: string }) => {
  const id = `local-${Date.now()}`
  businesses.value.push({
    id,
    name: payload.name,
    initials: initialsFor(payload.name),
    plan: "Trial",
    members: 1,
  })
  activeBusinessId.value = id
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[#E9E9EF] bg-white px-4 py-3 sm:px-6"
  >
    <button
      type="button"
      class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#4A4A57] transition hover:bg-[#F2F2F6] lg:hidden"
      aria-label="Menyuni ochish"
      @click="$emit('openNav')"
    >
      <CIcon name="menu" class="h-5 w-5" />
    </button>

    <div class="min-w-0 flex-1">
      <h1 class="truncate text-[19px] font-bold tracking-tight text-[#0F0F17]">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="truncate text-[13px] text-[#8E8E9C]">
        {{ subtitle }}
      </p>
    </div>

    <label class="relative hidden min-w-0 max-w-[340px] flex-1 xl:block">
      <span class="sr-only">Qidiruv</span>
      <CIcon
        name="search"
        class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A2A2AE]"
      />
      <input
        type="search"
        placeholder="Qidirish"
        class="h-10 w-full rounded-xl border border-[#E4E4EB] bg-[#FBFBFC] pl-10 pr-14 text-sm text-[#12121C] outline-none transition placeholder:text-[#A8A8B4] focus:border-[#6633EE] focus:bg-white focus:ring-4 focus:ring-[#6633EE]/12"
      />
      <kbd
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-[#E4E4EB] bg-white px-1.5 py-0.5 font-sans text-[11px] font-medium text-[#8E8E9C]"
      >
        ⌘K
      </kbd>
    </label>

    <div class="flex items-center gap-2 sm:gap-3">
      <CBusinessSwitcher
        v-model:active-id="activeBusinessId"
        :businesses="businesses"
        @create="isCreateOpen = true"
      />

      <button
        type="button"
        class="hidden h-10 items-center gap-2 rounded-xl border border-[#E4E4EB] bg-white px-3.5 text-sm font-semibold text-[#12121A] shadow-[0_1px_2px_rgba(16,17,26,0.05)] transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC] md:inline-flex"
        @click="isCreateOpen = true"
      >
        <CIcon name="plus" class="h-4 w-4" />
        Yangi biznes
      </button>

      <span class="hidden h-6 w-px bg-[#E9E9EF] sm:block" aria-hidden="true" />

      <button
        type="button"
        class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#4A4A57] transition hover:bg-[#F2F2F6]"
        aria-label="Bildirishnomalar"
      >
        <CIcon name="bell" class="h-5 w-5" />
        <span
          v-if="user.notifications"
          class="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#E5484D] ring-2 ring-white"
          aria-hidden="true"
        />
      </button>

      <CUserMenu
        :name="user.name"
        :email="user.email"
        :initials="user.initials"
        :balance="user.balance"
        :notifications="user.notifications"
      />
    </div>

    <CCreateBusinessModal
      v-model:open="isCreateOpen"
      :copy-from="activeBusiness.name"
      @create="createBusiness"
    />
  </header>
</template>
