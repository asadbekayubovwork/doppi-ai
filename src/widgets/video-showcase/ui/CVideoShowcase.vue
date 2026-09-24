<script setup lang="ts">
import { ref, watch } from "vue"
import { useInView, usePrefersReducedMotion } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import { SERVICE_PATHS } from "@/shared/config/seoPages"
import { SHOWCASE_COLUMNS } from "../model/columns"

const wall = ref<HTMLElement | null>(null)
const videos = ref<HTMLVideoElement[]>([])
const inView = useInView(wall, { threshold: 0 })
const reduced = usePrefersReducedMotion()

// Phones get two columns, sm three, lg all five.
const columnClass = (index: number) =>
  index >= 3 ? "hidden lg:flex" : index === 2 ? "hidden sm:flex" : "flex"

// The clips weigh ~28 MB together, so nothing loads (preload="none") until
// the wall scrolls into view, and they pause again once it leaves. Clips in
// columns hidden at this breakpoint have no offsetParent and stay unloaded.
// Reduced motion keeps every clip on its first frame.
watch([inView, reduced], ([visible, still]) => {
  for (const video of videos.value) {
    if (visible && !still && video.offsetParent) video.play().catch(() => {})
    else if (!video.paused) video.pause()
  }
})
</script>

<template>
  <section id="studio" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <div
        class="rounded-[28px] bg-sand-950 p-5 sm:p-10 lg:p-12"
        data-aos="fade-up"
        data-aos-duration="900"
      >
        <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div class="max-w-[680px]">
            <span
              class="inline-flex items-center gap-2 rounded-full bg-volt px-3.5 py-1.5 text-sm font-medium text-sand-950"
            >
              <CIcon name="sparkles" class="h-4 w-4" />
              {{ $t("studio.badge") }}
            </span>
            <h2
              class="mt-6 text-[32px] font-bold uppercase leading-[105%] tracking-tight text-volt sm:text-5xl lg:text-[56px]"
            >
              {{ $t("studio.title") }}
            </h2>
            <p class="mt-5 text-base leading-[165%] text-sand-400 sm:text-lg">
              {{ $t("studio.subtitle") }}
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <RouterLink
              to="/login"
              class="flex h-12 items-center justify-center rounded-full bg-volt px-7 font-semibold text-sand-950 transition-300 hover:bg-volt/85"
            >
              {{ $t("studio.ctaPrimary") }}
            </RouterLink>
            <RouterLink
              :to="SERVICE_PATHS.video"
              class="flex h-12 items-center justify-center rounded-full border border-white/20 px-7 font-semibold text-white transition-300 hover:bg-white/10"
            >
              {{ $t("studio.ctaSecondary") }}
            </RouterLink>
          </div>
        </div>

        <div class="relative mt-10 sm:mt-12">
          <!-- Decorative (muted, no controls), so hidden from assistive tech.
               The wall fades out into the card at the bottom. -->
          <div
            ref="wall"
            class="grid h-[460px] grid-cols-2 gap-3 [mask-image:linear-gradient(to_bottom,black_70%,transparent)] sm:h-[560px] sm:grid-cols-3 sm:gap-4 lg:h-[640px] lg:grid-cols-5"
            aria-hidden="true"
          >
            <div
              v-for="(column, c) in SHOWCASE_COLUMNS"
              :key="c"
              class="min-h-0 flex-col gap-3 sm:gap-4"
              :class="columnClass(c)"
            >
              <div
                v-for="tile in column"
                :key="tile.file"
                class="relative min-h-0 basis-0 overflow-hidden rounded-2xl bg-sand-900"
                :style="{ flexGrow: tile.grow }"
              >
                <video
                  ref="videos"
                  :src="`/videos/${tile.file}`"
                  class="absolute inset-0 h-full w-full object-cover"
                  :preload="reduced ? 'metadata' : 'none'"
                  muted
                  loop
                  playsinline
                  disablepictureinpicture
                />
                <span
                  v-if="tile.tag"
                  class="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-md sm:text-sm"
                >
                  {{ $t(`studio.tags.${tile.tag}`) }}
                </span>
              </div>
            </div>
          </div>

          <RouterLink
            :to="SERVICE_PATHS.video"
            class="absolute bottom-4 left-1/2 z-10 flex h-12 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-volt px-6 font-semibold text-sand-950 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] transition-300 hover:bg-volt/85"
          >
            {{ $t("studio.gallery") }}
            <CIcon name="arrow-up-right" class="h-4 w-4" />
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
