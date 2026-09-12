<script setup lang="ts">
import { computed, ref } from "vue"
import { useDismiss } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import type { Business } from "../model/types"

const props = defineProps<{
  businesses: Business[]
  activeId: string
}>()

const emit = defineEmits<{
  "update:activeId": [id: string]
  create: []
}>()

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const close = () => (isOpen.value = false)

useDismiss(root, close)

const active = computed(
  () =>
    props.businesses.find((item) => item.id === props.activeId) ??
    props.businesses[0] ?? {
      id: "",
      name: "Biznes tanlang",
      slug: "",
      status: "",
      default_language: "uz",
      billing_region: "UZ",
      initials: "??",
      plan: "",
    }
)

const select = (id: string) => {
  emit("update:activeId", id)
  close()
}

const requestCreate = () => {
  close()
  emit("create")
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="hidden items-center gap-2.5 rounded-xl border bg-white py-1.5 pl-2 pr-3 text-left transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC] sm:inline-flex"
      :class="isOpen ? 'border-[#6633EE]' : 'border-[#E4E4EB]'"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFEAFE] text-[11px] font-semibold text-[#6633EE]"
        aria-hidden="true"
      >
        {{ active.initials }}
      </span>
      <span class="block">
        <span
          class="block text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#A2A2AE]"
        >
          Biznes
        </span>
        <span class="block text-[13.5px] font-semibold text-[#12121C]">
          {{ active.name }}
        </span>
      </span>
      <CIcon name="chevrons-up-down" class="h-4 w-4 shrink-0 text-[#A2A2AE]" />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 z-30 mt-2 w-[300px] origin-top-right overflow-hidden rounded-2xl border border-[#E9E9EF] bg-white shadow-[0_16px_40px_rgba(16,17,26,0.14)]"
        role="menu"
      >
        <div class="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5">
          <span
            class="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#A2A2AE]"
          >
            Sizning bizneslaringiz
          </span>
          <span class="text-[12.5px] text-[#A2A2AE]">
            {{ businesses.length }}
          </span>
        </div>

        <ul class="pb-1">
          <li v-for="item in businesses" :key="item.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[#F7F7F9]"
              :class="item.id === activeId ? 'bg-[#F7F7F9]' : ''"
              role="menuitem"
              @click="select(item.id)"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFEAFE] text-[11px] font-semibold text-[#6633EE]"
                aria-hidden="true"
              >
                {{ item.initials }}
              </span>
              <span class="block min-w-0 flex-1">
                <span
                  class="block truncate text-[13.5px] font-semibold text-[#12121C]"
                >
                  {{ item.name }}
                </span>
                <span class="block truncate text-[12.5px] text-[#8E8E9C]">
                  {{ item.members === undefined ? item.plan : `${item.plan} · ${item.members} a'zo` }}
                </span>
              </span>
              <CIcon
                v-if="item.id === activeId"
                name="check"
                class="h-4 w-4 shrink-0 text-[#6633EE]"
              />
            </button>
          </li>
        </ul>

        <div class="border-t border-[#E9E9EF] py-1">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold text-[#6633EE] transition hover:bg-[#F7F7F9]"
            role="menuitem"
            @click="requestCreate"
          >
            <CIcon name="plus" class="h-4 w-4 shrink-0" />
            Yangi biznes yaratish
          </button>
          <RouterLink
            to="/app/settings"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-[#12121C] transition hover:bg-[#F7F7F9]"
            role="menuitem"
            @click="close"
          >
            <CIcon name="settings" class="h-4 w-4 shrink-0 text-[#8E8E9C]" />
            Biznes sozlamalari
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
