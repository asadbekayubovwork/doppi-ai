<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CAppWindow } from "@/shared/ui"

interface Source {
  icon: string
  name: string
  meta: string
}

// Step 01: the knowledge base, three files indexed and the website still going.
const base = "services.rag.landing.demo.kb"
const sources = useI18nList<Source>(`${base}.files`)

// The last source is the site crawl, the one still in progress.
const INDEXING_PERCENT = 64
</script>

<template>
  <CAppWindow :title="$t(`${base}.window`)" :label="$t(`${base}.alt`)">
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-[18px] py-4"
    >
      <span class="flex items-center gap-2.5">
        <span class="text-base font-semibold tracking-[-0.3px] text-[#15151B]">
          {{ $t(`${base}.title`) }}
        </span>
        <span
          class="rounded-full bg-[#EFECFF] px-2.5 py-1 text-[11.5px] font-semibold text-[#5B4BE8]"
        >
          {{ $t(`${base}.badge`) }}
        </span>
      </span>

      <span
        class="flex items-center gap-1.5 rounded-lg bg-[#15151B] px-3 py-2 text-[12.5px] font-medium text-white"
      >
        <CIcon name="plus" class="h-3.5 w-3.5" />
        {{ $t(`${base}.add`) }}
      </span>
    </div>

    <!-- Dropzone -->
    <div class="px-[18px] pb-3.5">
      <div
        class="flex flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-[#B6ABFF] bg-[#EFECFF] px-5 py-6"
      >
        <span
          class="grid h-11 w-11 place-items-center rounded-full bg-white text-[#5B4BE8]"
        >
          <CIcon name="cloud-upload" class="h-5 w-5" />
        </span>
        <span class="text-[14.5px] font-semibold text-[#15151B]">
          {{ $t(`${base}.dropTitle`) }}
        </span>
        <span class="text-center text-[12.5px] text-[#6A6A74]">{{
          $t(`${base}.dropSub`)
        }}</span>
      </div>
    </div>

    <!-- Sources -->
    <div
      v-for="(source, i) in sources"
      :key="source.name"
      class="flex items-center gap-3 border-t border-[#F0F0EC] px-[18px] py-3"
    >
      <span
        class="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] border border-[#E5E5E1] bg-[#FAFAF9] text-[#6A6A74]"
      >
        <CIcon :name="source.icon" class="h-4 w-4" />
      </span>

      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="truncate text-[13.5px] font-medium text-[#15151B]">{{
          source.name
        }}</span>
        <span class="text-xs text-[#84848E]">{{ source.meta }}</span>
      </span>

      <!-- The last row is still being crawled, so it shows progress instead. -->
      <span v-if="i < sources.length - 1" class="shrink-0">
        <span
          class="flex items-center gap-1.5 rounded-full bg-[#E6F4EC] px-2.5 py-1 text-[11.5px] font-semibold text-[#177A46]"
        >
          <CIcon name="check" class="h-3 w-3" stroke-width="2.5" />
          {{ $t(`${base}.indexed`) }}
        </span>
      </span>
      <span
        v-else
        class="flex w-[116px] shrink-0 flex-col items-end gap-1.5 sm:w-[160px]"
      >
        <span class="text-[11.5px] font-semibold text-[#5B4BE8]">
          {{ $t(`${base}.indexing`) }}
        </span>
        <span class="h-[5px] w-full overflow-hidden rounded-full bg-[#E5E5E1]">
          <span
            class="block h-full rounded-full bg-[#5B4BE8]"
            :style="{ width: `${INDEXING_PERCENT}%` }"
          />
        </span>
      </span>
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E5E1] bg-[#FAFAF9] px-[18px] py-3"
    >
      <span class="text-xs text-[#84848E]">{{ $t(`${base}.footer`) }}</span>
      <span
        class="flex items-center gap-1.5 text-xs font-medium text-[#177A46]"
      >
        <CIcon name="refresh-cw" class="h-[13px] w-[13px]" />
        {{ $t(`${base}.sync`) }}
      </span>
    </div>
  </CAppWindow>
</template>
