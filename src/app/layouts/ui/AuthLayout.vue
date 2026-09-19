<script setup lang="ts">
import { CAuthAside } from "@/features/auth"
</script>

<template>
  <!-- Shared by login, register, password reset and the OAuth callback. The
       layout instance survives navigation between them, so the brand panel
       (and its rotating testimonial) stays put while only the page in the
       right-hand column transitions.
       Each page fills the viewport and the page transition nudges it 6px down,
       which would flash a document scrollbar mid-swap; the column clips that
       overshoot. `clip` rather than `hidden`, so it is not a scroll container. -->
  <main class="flex min-h-dvh bg-white text-[#15151B]">
    <CAuthAside />
    <section class="flex min-w-0 flex-1 flex-col overflow-y-clip">
      <slot />
    </section>
  </main>
</template>
