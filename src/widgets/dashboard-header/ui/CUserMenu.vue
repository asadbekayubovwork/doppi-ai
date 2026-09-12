<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useDismiss } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import { messageForProblem, useAuthStore } from "@/features/auth"

const props = defineProps<{
  name: string
  email: string
  initials: string
  balance: string
  notifications: number
}>()

const router = useRouter()
const auth = useAuthStore()

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const close = () => (isOpen.value = false)

useDismiss(root, close)

// Light is the only theme the dashboard ships with so far; the row is here so
// the switch has a home once a dark palette exists.
const appearance = ref("Yorug'")
const errorMessage = ref("")

const signOut = async () => {
  close()
  errorMessage.value = ""
  try {
    await auth.logout()
  } catch (error) {
    errorMessage.value = messageForProblem(
      error,
      "Sessiya serverda yopilmadi, lekin bu qurilmadagi holat tozalandi."
    )
  } finally {
    await router.push({
      name: "Login",
      query: errorMessage.value ? { logout: "failed" } : undefined,
    })
  }
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-xl border bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-[#C9C9D6] hover:bg-[#FAFAFC]"
      :class="isOpen ? 'border-[#6633EE]' : 'border-[#E4E4EB]'"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#6633EE] text-[11px] font-semibold text-white"
        aria-hidden="true"
      >
        {{ props.initials }}
      </span>
      <span class="hidden text-[13.5px] font-semibold text-[#12121C] sm:block">
        {{ props.name.split(" ")[0] }}
      </span>
      <CIcon name="chevron-down" class="h-4 w-4 shrink-0 text-[#A2A2AE]" />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 z-30 mt-2 w-[290px] origin-top-right overflow-hidden rounded-2xl border border-[#E9E9EF] bg-white shadow-[0_16px_40px_rgba(16,17,26,0.14)]"
        role="menu"
      >
        <div
          class="flex items-center gap-3 border-b border-[#E9E9EF] px-4 py-3.5"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6633EE] text-[13px] font-semibold text-white"
            aria-hidden="true"
          >
            {{ props.initials }}
          </span>
          <span class="block min-w-0">
            <span
              class="block truncate text-[14px] font-semibold text-[#0F0F17]"
            >
              {{ props.name }}
            </span>
            <span class="block truncate text-[12.5px] text-[#8E8E9C]">
              {{ props.email }}
            </span>
          </span>
        </div>

        <div class="py-1">
          <RouterLink
            to="/app/settings"
            class="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-[#12121C] transition hover:bg-[#F7F7F9]"
            role="menuitem"
            @click="close"
          >
            <CIcon
              name="user-round"
              class="h-[18px] w-[18px] shrink-0 text-[#8E8E9C]"
            />
            <span class="flex-1">Hisob sozlamalari</span>
          </RouterLink>

          <RouterLink
            to="/app/usage"
            class="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-[#12121C] transition hover:bg-[#F7F7F9]"
            role="menuitem"
            @click="close"
          >
            <CIcon
              name="credit-card"
              class="h-[18px] w-[18px] shrink-0 text-[#8E8E9C]"
            />
            <span class="flex-1">To'lov va balans</span>
            <span class="text-[13px] text-[#8E8E9C]">{{ props.balance }}</span>
          </RouterLink>

          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13.5px] font-medium text-[#12121C] transition hover:bg-[#F7F7F9]"
            role="menuitem"
          >
            <CIcon
              name="bell"
              class="h-[18px] w-[18px] shrink-0 text-[#8E8E9C]"
            />
            <span class="flex-1">Bildirishnomalar</span>
            <span v-if="props.notifications" class="text-[13px] text-[#8E8E9C]">
              {{ props.notifications }}
            </span>
          </button>

          <RouterLink
            to="/app/api-keys"
            class="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-[#12121C] transition hover:bg-[#F7F7F9]"
            role="menuitem"
            @click="close"
          >
            <CIcon
              name="key-round"
              class="h-[18px] w-[18px] shrink-0 text-[#8E8E9C]"
            />
            <span class="flex-1">API kalitlar</span>
          </RouterLink>

          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13.5px] font-medium text-[#12121C] transition hover:bg-[#F7F7F9]"
            role="menuitem"
          >
            <CIcon
              name="moon"
              class="h-[18px] w-[18px] shrink-0 text-[#8E8E9C]"
            />
            <span class="flex-1">Ko'rinish</span>
            <span class="text-[13px] text-[#8E8E9C]">{{ appearance }}</span>
            <CIcon
              name="chevron-right"
              class="h-4 w-4 shrink-0 text-[#C4C4CE]"
            />
          </button>
        </div>

        <div class="border-t border-[#E9E9EF] py-1">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13.5px] font-semibold text-[#E5484D] transition hover:bg-[#FFF5F5]"
            role="menuitem"
            @click="signOut"
          >
            <CIcon name="log-out" class="h-[18px] w-[18px] shrink-0" />
            Chiqish
          </button>
        </div>
      </div>
    </Transition>
    <p v-if="errorMessage" class="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-[#F3C5C5] bg-[#FFF0F0] px-3 py-2 text-xs text-[#C42B2B]" role="alert">{{ errorMessage }}</p>
  </div>
</template>
