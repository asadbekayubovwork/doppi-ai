<script setup lang="ts">
import { computed } from "vue"
import { useHead } from "@unhead/vue"
import { useAuthStore } from "@/features/auth"
import { usePageHeading } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import { SERVICES } from "@/widgets/dashboard-sidebar"

useHead({ title: "Home — Do'ppi AI" })

const auth = useAuthStore()

const greeting = (() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 18) return "Good afternoon"
  return "Good evening"
})()

const headline = computed(() => {
  const name = auth.user?.first_name?.trim()
  return name ? `${greeting}, ${name}` : greeting
})

usePageHeading(() => {
  const business = auth.activeBusiness?.name
  return business ? { subtitle: `${business} · workspace overview` } : {}
})
</script>

<template>
  <div
    class="flex min-h-full flex-col items-center justify-center py-8 sm:py-12"
  >
    <div class="text-center">
      <p class="text-[15px] text-[#84848E]">My workspace</p>
      <h2
        class="mt-2 text-3xl font-bold tracking-tight text-[#15151B] sm:text-[42px] sm:leading-[1.15]"
      >
        {{ headline }}
      </h2>
    </div>

    <ul
      class="mt-10 grid w-full max-w-[1080px] grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-6"
      aria-label="Services"
    >
      <li v-for="service in SERVICES" :key="service.to">
        <RouterLink
          :to="service.to"
          class="group block rounded-[20px] focus-visible:outline-none"
        >
          <span
            class="flex aspect-[2/1] items-center justify-center rounded-[20px] border border-[#E5E5E1] bg-white transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[#D6D6D1] group-hover:shadow-[0_18px_40px_-24px_rgba(21,21,27,0.25)] group-focus-visible:ring-2 group-focus-visible:ring-[#5B4BE8]/40 sm:aspect-square"
          >
            <span
              class="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-[#EEEEEA] bg-[#F7F7F5] text-[#15151B] transition group-hover:border-[#DCD6FF] group-hover:bg-[#F3F1FF] group-hover:text-[#5B4BE8]"
              aria-hidden="true"
            >
              <CIcon :name="service.icon" class="h-8 w-8" stroke-width="2" />
            </span>
          </span>
          <span
            class="mt-4 block text-center text-base font-medium text-[#15151B]"
          >
            {{ $t(service.labelKey) }}
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
