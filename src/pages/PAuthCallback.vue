<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useHead } from "@unhead/vue"
import { useAuthStore, safeLocalPath } from "@/features/auth"

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const errorMessage = ref("")

useHead({ title: "Kirish tasdiqlanmoqda — Do'ppi.ai" })

onMounted(async () => {
  if (route.query.status !== "success") {
    errorMessage.value = "Google orqali kirish yakunlanmadi. Qayta urinib ko'ring."
    return
  }

  const authenticated = await auth.bootstrap(true)
  if (!authenticated) {
    errorMessage.value = "Sessiya topilmadi. Qayta kirishga urinib ko'ring."
    return
  }

  const stored = sessionStorage.getItem("doppi_auth_return_path")
  sessionStorage.removeItem("doppi_auth_return_path")
  await router.replace(safeLocalPath(stored))
})
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-[#F5F5F3] px-6">
    <section class="w-full max-w-[400px] rounded-2xl border border-[#E5E5E1] bg-white p-8 text-center shadow-sm">
      <div v-if="!errorMessage" aria-live="polite">
        <span class="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#EFECFF] text-[#5B4BE8]">…</span>
        <h1 class="mt-5 text-xl font-semibold text-[#15151B]">Kirish tasdiqlanmoqda</h1>
        <p class="mt-2 text-sm text-[#6A6A74]">Sessiyangizni tekshiryapmiz.</p>
      </div>
      <div v-else role="alert">
        <h1 class="text-xl font-semibold text-[#15151B]">Kirish amalga oshmadi</h1>
        <p class="mt-2 text-sm text-[#6A6A74]">{{ errorMessage }}</p>
        <RouterLink to="/login" class="mt-6 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#5B4BE8] px-5 text-sm font-semibold text-white">Kirishga qaytish</RouterLink>
      </div>
    </section>
  </main>
</template>
