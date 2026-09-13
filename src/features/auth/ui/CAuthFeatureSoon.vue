<script setup lang="ts">
defineProps<{ title: string; message: string }>()
</script>

<template>
  <h1 class="text-[28px] font-semibold tracking-[-0.8px]">{{ title }}</h1>
  <p
    class="mt-3 rounded-[10px] border border-[#E5E5E1] bg-[#FAFAF9] px-4 py-3 text-center text-sm leading-6 text-[#6A6A74]"
    role="status"
  >
    {{ message }}
  </p>
  <RouterLink
    to="/login"
    class="mt-5 flex h-11 items-center justify-center rounded-[10px] bg-[#5B4BE8] text-sm font-semibold text-white"
  >
    Kirish sahifasiga qaytish
  </RouterLink>
</template>
