<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { BRAND_MARKS, CBrandMark, CIcon, CLogoLoop } from "@/shared/ui"

interface Channel {
  icon: string
  label: string
}

const channels = useI18nList<Channel>("trust.channels")

// Channels without a brand logo (SIP telephony) take a stroke icon and the
// site's violet as their hover tint.
const tint = (icon: string) => BRAND_MARKS[icon]?.color ?? "#8F6BFF"
</script>

<template>
  <div class="section-dark border-y border-white/10 py-10">
    <div class="container relative z-10">
      <p
        class="text-center text-xs font-medium uppercase tracking-[0.18em] text-[#A3A3A3]"
      >
        {{ $t("trust.label") }}
      </p>

      <!-- Logos stay monochrome and pick up their brand colour on hover; the
           strip glides to a stop under the mouse. -->
      <CLogoLoop :items="channels" class="mask-fade-x mt-6">
        <template #item="{ item }">
          <span
            class="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#A3A3A3] transition-colors duration-200 hover:border-[#6633EE]/50 hover:text-white"
            :style="{ '--brand': tint(item.icon) }"
          >
            <CBrandMark
              v-if="BRAND_MARKS[item.icon]"
              :name="item.icon"
              class="h-4 w-4 shrink-0 transition-colors duration-200 group-hover:text-[color:var(--brand)]"
            />
            <CIcon
              v-else
              :name="item.icon"
              class="h-4 w-4 shrink-0 transition-colors duration-200 group-hover:text-[color:var(--brand)]"
            />
            {{ item.label }}
          </span>
        </template>
      </CLogoLoop>
    </div>
  </div>
</template>
