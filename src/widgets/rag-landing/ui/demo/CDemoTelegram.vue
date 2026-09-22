<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CPhoneFrame } from "@/shared/ui"

interface Turn {
  role: "client" | "bot"
  text: string
  time: string
  source?: string
  sourceIcon?: string
}

// Step 02: the customer asking on Telegram, each answer carrying its source.
const base = "services.rag.landing.demo.chat"
const turns = useI18nList<Turn>(`${base}.turns`)
</script>

<template>
  <CPhoneFrame
    :label="$t(`${base}.alt`)"
    tone="light"
    chrome-class="bg-[#F7F7F8]"
    screen-class="bg-white"
  >
    <div class="flex flex-1 flex-col">
      <!-- Chat header -->
      <div class="flex items-center gap-2.5 bg-[#F7F7F8] px-3.5 pb-2.5 pt-2">
        <CIcon name="chevron-left" class="h-5 w-5 shrink-0 text-[#2F8FEC]" />
        <span
          class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6C5CF5] to-[#B6ABFF] text-sm font-bold text-white"
        >
          D
        </span>
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="truncate text-[13px] font-semibold text-[#15151B]">
            {{ $t(`${base}.bot`) }}
          </span>
          <span class="text-[11px] text-[#8A8A90]">{{
            $t(`${base}.status`)
          }}</span>
        </span>
        <CIcon
          name="ellipsis-vertical"
          class="h-[17px] w-[17px] shrink-0 text-[#8A8A90]"
        />
      </div>

      <!-- Thread -->
      <div
        class="flex flex-1 flex-col justify-end gap-[7px] bg-[linear-gradient(120deg,#DCE6F0_18%,#EEF1F5_82%)] px-3 py-2.5"
      >
        <div
          v-for="(turn, i) in turns"
          :key="i"
          class="flex"
          :class="turn.role === 'client' ? 'justify-end' : 'justify-start'"
        >
          <span
            class="flex max-w-[86%] flex-col gap-1.5 px-[11px] pb-1.5 pt-2"
            :class="
              turn.role === 'client'
                ? 'rounded-[14px_14px_4px_14px] bg-[#2F8FEC]'
                : 'rounded-[14px_14px_14px_4px] bg-white'
            "
          >
            <span
              class="whitespace-pre-line text-[12.5px] leading-[18px]"
              :class="turn.role === 'client' ? 'text-white' : 'text-[#15151B]'"
            >
              {{ turn.text }}
            </span>

            <span
              v-if="turn.source"
              class="flex w-fit items-center gap-1.5 rounded-lg bg-[#F0F3F7] px-2 py-1 text-[10.5px] font-medium text-[#5B4BE8]"
            >
              <CIcon :name="turn.sourceIcon ?? 'file-text'" class="h-3 w-3" />
              {{ $t(`${base}.sourceLabel`) }}: {{ turn.source }}
            </span>

            <span
              class="flex items-center justify-end gap-[3px] text-[9.5px]"
              :class="
                turn.role === 'client' ? 'text-[#DCEBFB]' : 'text-[#A0A0A8]'
              "
            >
              {{ turn.time }}
              <CIcon
                v-if="turn.role === 'client'"
                name="check-check"
                class="h-3 w-3"
              />
            </span>
          </span>
        </div>
      </div>

      <!-- Composer -->
      <div class="flex items-center gap-2.5 bg-[#F7F7F8] px-3 py-2.5">
        <CIcon
          name="paperclip"
          class="h-[18px] w-[18px] shrink-0 text-[#8A8A90]"
        />
        <span
          class="flex-1 rounded-full border border-[#DCDCE0] bg-white px-3 py-2 text-[12.5px] text-[#A0A0A8]"
        >
          {{ $t(`${base}.placeholder`) }}
        </span>
        <CIcon name="mic" class="h-[18px] w-[18px] shrink-0 text-[#8A8A90]" />
      </div>
    </div>
  </CPhoneFrame>
</template>
