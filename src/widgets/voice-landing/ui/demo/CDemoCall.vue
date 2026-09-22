<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CPhoneFrame } from "@/shared/ui"

interface Control {
  icon: string
  key: string
  label: string
}

// Step 03: the agent on the line, 42 seconds in and recording, as the phone
// itself shows it.
const base = "services.voice.landing.demo.call"
const controls = useI18nList<Control>(`${base}.controls`)

// A voice agent has no camera, so the dialler greys that one control out.
const isOff = (control: Control) => control.key === "videoCall"
</script>

<template>
  <CPhoneFrame
    :label="$t(`${base}.alt`)"
    time="12:36"
    nav="android"
    screen-class="screen-call-gradient"
  >
    <div class="flex flex-1 flex-col px-4 pb-2">
      <!-- Call timer and recording state -->
      <div class="flex items-center justify-between pt-1.5 text-white">
        <span class="w-4" />
        <span class="flex items-center gap-1.5 text-[13px]">
          <CIcon name="phone" class="h-3.5 w-3.5" />
          {{ $t(`${base}.duration`) }}
          <span class="px-0.5 text-white/40">/</span>
          <span class="h-[7px] w-[7px] rounded-full bg-[#E5484D]" />
          {{ $t(`${base}.rec`) }} {{ $t(`${base}.duration`) }}
        </span>
        <CIcon name="ellipsis-vertical" class="h-4 w-4 text-white/80" />
      </div>

      <!-- Who is on the line -->
      <div class="mt-7 flex flex-col items-center gap-3">
        <span class="text-[26px] font-medium tracking-[-0.5px] text-white">
          {{ $t(`${base}.number`) }}
        </span>
        <span
          class="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] text-white"
        >
          <span class="h-[7px] w-[7px] rounded-full bg-[#D3F26A]" />
          {{ $t(`${base}.caller`) }}
        </span>
      </div>

      <!-- What the agent has just agreed to -->
      <div
        class="mt-auto flex items-center gap-2.5 rounded-full border border-white/15 bg-white/15 px-4 py-3 backdrop-blur-sm"
      >
        <CIcon name="audio-lines" class="h-4 w-4 shrink-0 text-[#D3F26A]" />
        <span class="text-[12px] leading-tight text-white">{{
          $t(`${base}.line`)
        }}</span>
      </div>

      <!-- Dialler controls -->
      <div
        class="mt-3 rounded-[26px] border border-white/12 bg-white/15 px-4 pb-4 pt-5 backdrop-blur-sm"
      >
        <div class="grid grid-cols-3 gap-y-5">
          <span
            v-for="control in controls"
            :key="control.key"
            class="flex flex-col items-center gap-2"
            :class="isOff(control) ? 'text-white/35' : 'text-white'"
          >
            <CIcon
              :name="control.icon"
              class="h-[22px] w-[22px]"
              :class="control.key === 'stopRecording' ? 'text-[#D3F26A]' : ''"
            />
            <span class="text-center text-[11px] leading-tight">{{
              control.label
            }}</span>
          </span>
        </div>

        <div class="mt-5 flex justify-center">
          <span
            class="grid h-[54px] w-[54px] place-items-center rounded-full bg-[#E5484D] text-white"
          >
            <CIcon name="phone-off" class="h-6 w-6" />
          </span>
        </div>
      </div>
    </div>
  </CPhoneFrame>
</template>
