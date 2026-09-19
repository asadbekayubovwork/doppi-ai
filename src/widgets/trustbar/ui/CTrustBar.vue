<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { BRAND_MARKS, CBrandMark, CIcon, CLogoLoop } from "@/shared/ui"

interface Channel {
  icon: string
  label: string
}

const channels = useI18nList<Channel>("trust.channels")

// Channels without a brand logo (SIP telephony) take a stroke icon and the
// site's accent as their hover tint.
const tint = (icon: string) => BRAND_MARKS[icon]?.color ?? "#FF4704"
</script>

<template>
  <div class="section-ground border-y border-sand-200 py-10">
    <div class="container relative z-10">
      <p
        class="text-center text-xs font-medium uppercase tracking-[0.18em] text-sand-500"
      >
        {{ $t("trust.label") }}
      </p>

      <!-- Logos stay monochrome and pick up their brand colour on hover; the
           strip glides to a stop under the mouse. -->
      <CLogoLoop :items="channels" :gap="16" class="mask-fade-x mt-6">
        <template #item="{ item }">
          <span
            class="group inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-sand-200 bg-white px-5 py-2.5 text-base text-sand-500 transition-colors duration-200 hover:border-sand-400 hover:text-sand-950"
            :style="{ '--brand': tint(item.icon) }"
          >
            <CBrandMark
              v-if="BRAND_MARKS[item.icon]"
              :name="item.icon"
              class="h-5 w-5 shrink-0 transition-colors duration-200 group-hover:text-[color:var(--brand)]"
            />
            <CIcon
              v-else
              :name="item.icon"
              class="h-5 w-5 shrink-0 transition-colors duration-200 group-hover:text-[color:var(--brand)]"
            />
            {{ item.label }}
          </span>
        </template>
      </CLogoLoop>
    </div>
  </div>
</template>
