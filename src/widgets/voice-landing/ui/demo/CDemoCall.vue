<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import CPhoneFrame from "./CPhoneFrame.vue"

interface Turn {
  role: "agent" | "client"
  text: string
}

// Step 03: the agent on the line, 42 seconds into the call.
const base = "services.voice.landing.demo.call"
const turns = useI18nList<Turn>(`${base}.turns`)

// Bar heights in px; every fourth-ish bar is lit, so the wave reads as speech
// rather than as an even equaliser.
const BARS = [
  8, 14, 22, 32, 18, 26, 38, 24, 12, 20, 30, 42, 26, 16, 10, 22, 34, 44, 28, 18,
  12, 24, 36, 20, 14, 8, 16, 28, 20, 10,
]
const LIT = new Set([3, 6, 10, 11, 16, 17, 22])
</script>

<template>
  <CPhoneFrame
    :label="$t(`${base}.alt`)"
    screen-class="bg-gradient-to-br from-[#2F2668] via-[#241E52] to-[#171338]"
  >
    <div class="flex flex-1 flex-col">
      <!-- Who is calling -->
      <div class="flex flex-col items-center gap-2.5 px-5 pt-2.5">
        <span
          class="flex items-center gap-1.5 rounded-full bg-white/10 px-[11px] py-[5px] text-[11px] font-medium text-[#E6E6EE]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#B6ABFF]" />
          {{ $t(`${base}.sip`) }}
        </span>

        <span
          class="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-[#6C5CF5] to-[#3A2F9E] text-white"
        >
          <CIcon name="audio-lines" class="h-7 w-7" />
        </span>

        <span class="text-base font-semibold tracking-[-0.3px] text-white">
          {{ $t(`${base}.agent`) }}
        </span>
        <span class="-mt-2 text-[11.5px] text-[#A8A8B8]">{{
          $t(`${base}.meta`)
        }}</span>
      </div>

      <!-- Live waveform -->
      <div class="flex h-10 items-center justify-center gap-[3px] px-[26px]">
        <span
          v-for="(height, i) in BARS"
          :key="i"
          class="wave-bar w-[3px] origin-center rounded-full"
          :class="LIT.has(i) ? 'bg-[#B6ABFF]' : 'bg-white/35'"
          :style="{
            height: `${height}px`,
            animation: `wave 1.4s ease-in-out ${(i % 7) * 0.13}s infinite`,
          }"
        />
      </div>

      <!-- Transcript -->
      <div class="flex flex-col gap-1.5 px-4 py-1">
        <span
          v-for="(turn, i) in turns"
          :key="i"
          class="flex flex-col gap-[3px] rounded-xl px-[11px] py-2"
          :class="turn.role === 'agent' ? 'bg-white/10' : 'bg-white/15'"
        >
          <span
            class="text-[9px] font-semibold tracking-[1px]"
            :class="turn.role === 'agent' ? 'text-[#B6ABFF]' : 'text-[#A8A8B8]'"
          >
            {{
              turn.role === "agent"
                ? $t(`${base}.roles.agent`)
                : $t(`${base}.roles.client`)
            }}
          </span>
          <span class="text-[11px] leading-[15px] text-[#E9E9F0]">{{
            turn.text
          }}</span>
        </span>
      </div>

      <!-- Controls -->
      <div
        class="mt-auto flex flex-col items-center gap-[18px] px-[34px] pt-[22px]"
      >
        <span class="flex w-full items-center justify-between">
          <span
            v-for="control in ['mic-off', 'grid-3x3', 'volume-2']"
            :key="control"
            class="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"
          >
            <CIcon :name="control" class="h-[19px] w-[19px]" />
          </span>
        </span>

        <span
          class="grid h-[50px] w-[50px] place-items-center rounded-full bg-[#C42B2B] text-white"
        >
          <CIcon name="phone-off" class="h-5 w-5" />
        </span>
      </div>
    </div>
  </CPhoneFrame>
</template>
