<script setup lang="ts">
import { useI18nList } from "@/shared/lib"

// Two identical copies keep the -50% marquee loop seamless; the second one is
// hidden from screen readers so the channel list is not announced twice.
const channels = useI18nList<string>("trust.channels")
</script>

<template>
  <div class="section-dark border-y border-white/10 py-10">
    <div class="container relative z-10">
      <p class="text-center text-xs font-medium uppercase tracking-[0.18em] text-[#A3A3A3]">
        {{ $t("trust.label") }}
      </p>

      <div class="mask-fade-x relative mt-6 overflow-hidden">
        <ul class="flex w-max animate-marquee">
          <li
            v-for="copy in 2"
            :key="copy"
            :aria-hidden="copy === 2 ? 'true' : undefined"
            class="flex shrink-0 items-center gap-3 pr-3"
          >
            <span
              v-for="channel in channels"
              :key="channel"
              class="group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#A3A3A3] transition-colors duration-200 hover:border-[#6633EE]/50 hover:text-white"
            >
              <span
                class="h-1.5 w-1.5 rounded-full bg-[#8F6BFF] transition-transform duration-200 group-hover:scale-150"
                aria-hidden="true"
              />
              {{ channel }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
