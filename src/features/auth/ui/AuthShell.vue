<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { CDoppiMark } from "@/shared/ui"

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: "Do'ppi.ai",
    description: "Do'ppi.ai autentifikatsiyasi",
  }
)

useHead({
  title: "Do'ppi.ai",
  meta: [{ name: "description", content: "Do'ppi.ai autentifikatsiyasi" }],
})
</script>

<template>
  <div class="flex min-h-dvh min-w-0 flex-1 flex-col px-8 py-[26px] sm:px-8">
    <!-- The right-hand column of AuthLayout. The dark brand panel lives in the
         layout, so moving between auth pages only swaps this column.
         Keep this comment inside the root: a comment beside it turns the root
         into a fragment in dev, and the out-in page transition in App.vue then
         never finishes leaving, so the next auth page never renders. -->
    <header
      class="flex items-center gap-4"
      :class="{ 'lg:hidden': !$slots.header }"
    >
      <RouterLink
        to="/"
        class="inline-flex items-center gap-3 lg:hidden"
        aria-label="Do'ppi AI bosh sahifasi"
        ><!-- logo.svg's wordmark is white, so on this light header the mark
             sits on a dark tile beside a dark wordmark in the logo's colours. -->
        <span
          class="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#121216]"
          ><CDoppiMark class="h-5 w-5 text-white" /></span
        ><span class="text-base font-semibold tracking-tight"
          >Do'ppi <span class="text-[#7A48FF]">AI</span></span
        ></RouterLink
      >
      <div v-if="$slots.header" class="ml-auto flex items-center gap-3">
        <slot name="header" />
      </div>
    </header>
    <div class="flex flex-1 items-center justify-center py-6 sm:py-10">
      <div class="w-full max-w-[400px]"><slot /></div>
    </div>
    <slot name="footer">
      <p class="text-center text-xs leading-5 text-[#84848E]">
        Davom etish orqali siz
        <RouterLink to="/terms" class="hover:underline"
          >foydalanish shartlari</RouterLink
        >
        va
        <RouterLink to="/privacy" class="hover:underline"
          >maxfiylik siyosatiga</RouterLink
        >
        rozilik bildirasiz.
      </p>
    </slot>
  </div>
</template>
