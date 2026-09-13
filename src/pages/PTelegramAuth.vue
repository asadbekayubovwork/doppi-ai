<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const challengeId = computed(() =>
  typeof route.query.challenge_id === "string" ? route.query.challenge_id : ""
)
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-[#F5F5F3] px-6">
    <section class="w-full max-w-[400px] rounded-2xl border border-[#E5E5E1] bg-white p-8 text-center shadow-sm">
      <h1 class="text-xl font-semibold text-[#15151B]">Telegram orqali kirish</h1>
      <p class="mt-2 text-sm text-[#6A6A74]">
        {{ challengeId ? "Telegram hisobingizni ulash uchun avval email bilan kiring." : "Telegram orqali kirish tez orada ishga tushadi." }}
      </p>
      <RouterLink to="/login" class="mt-6 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#5B4BE8] px-5 text-sm font-semibold text-white">Kirishga qaytish</RouterLink>
    </section>
  </main>
</template>
