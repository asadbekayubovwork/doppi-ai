<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CPhoneFrame } from "@/shared/ui"
import postImage from "@/shared/assets/png/vg-post-reel.jpg"
import avatarClinic from "@/shared/assets/png/vg-avatar-clinic.jpg"
import story1 from "@/shared/assets/png/vg-story-1.jpg"
import story2 from "@/shared/assets/png/vg-story-2.jpg"
import story3 from "@/shared/assets/png/vg-story-3.jpg"
import story4 from "@/shared/assets/png/vg-story-4.jpg"

interface Tile {
  icon: string
  value: string
  label: string
  delta: string
}

interface Bar {
  day: string
  height: number
  lit: boolean
}

// Step 03: the post as Instagram shows it, next to what it earned.
const base = "services.video.landing.demo.post"
const stories = useI18nList<string>(`${base}.stories`)
const tiles = useI18nList<Tile>(`${base}.tiles`)
const chart = useI18nList<Bar>(`${base}.chart`)

const STORY_AVATARS = [story1, avatarClinic, story2, story3, story4]
</script>

<template>
  <div
    class="flex w-full flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-5"
  >
    <CPhoneFrame
      :label="$t(`${base}.alt`)"
      tone="light"
      chrome-class="bg-white"
      screen-class="bg-white"
    >
      <div class="flex flex-1 flex-col">
        <!-- App bar -->
        <div class="flex items-center justify-between px-3.5 pb-2.5 pt-1">
          <CIcon name="plus" class="h-5 w-5 text-[#15151B]" />
          <span class="flex items-center gap-1.5">
            <span class="text-[22px] leading-none text-[#15151B]"
              >Instagram</span
            >
            <CIcon name="chevron-down" class="h-3 w-3 text-[#15151B]" />
          </span>
          <span class="relative">
            <CIcon name="heart" class="h-5 w-5 text-[#15151B]" />
            <span
              class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#E5484D]"
            />
          </span>
        </div>

        <!-- Stories -->
        <div class="flex gap-[7px] px-2 pb-2.5">
          <span
            v-for="(story, i) in stories"
            :key="story"
            class="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <span
              class="rounded-full bg-gradient-to-tr from-[#F0562A] via-[#D62976] to-[#962FBF] p-[2px]"
            >
              <span class="block rounded-full bg-white p-[2px]">
                <img
                  :src="STORY_AVATARS[i]"
                  alt=""
                  class="h-[38px] w-[38px] rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </span>
            <span
              class="w-full truncate text-center text-[8.5px] text-[#15151B]"
            >
              {{ story }}
            </span>
          </span>
        </div>

        <!-- The post the agent published -->
        <div class="flex items-center gap-2.5 px-3 py-[7px]">
          <img
            :src="avatarClinic"
            alt=""
            class="h-[30px] w-[30px] shrink-0 rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-xs font-semibold text-[#15151B]">
              {{ $t(`${base}.author`) }}
            </span>
            <span class="text-[10px] text-[#8A8A90]">{{
              $t(`${base}.meta`)
            }}</span>
          </span>
          <CIcon name="ellipsis" class="h-4 w-4 shrink-0 text-[#15151B]" />
        </div>

        <div class="relative h-[250px] w-full">
          <img
            :src="postImage"
            alt=""
            class="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <span
            class="absolute right-2 top-2 flex items-center gap-1 rounded-[7px] bg-black/45 px-1.5 py-[3px] text-[9.5px] font-semibold text-white"
          >
            <CIcon name="clapperboard" class="h-[11px] w-[11px]" />
            {{ $t(`${base}.duration`) }}
          </span>
          <span
            class="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-sand-950/75 px-2 py-1 text-[9px] font-semibold text-white"
          >
            <CIcon name="wand-sparkles" class="h-2.5 w-2.5" />
            {{ $t(`${base}.aiBadge`) }}
          </span>
        </div>

        <div
          class="flex items-center justify-between px-3 pb-1 pt-2.5 text-[#15151B]"
        >
          <span class="flex items-center gap-3">
            <span
              v-for="action in [
                { icon: 'heart', count: $t(`${base}.likes`) },
                { icon: 'message-circle', count: $t(`${base}.comments`) },
                { icon: 'send', count: $t(`${base}.shares`) },
              ]"
              :key="action.icon"
              class="flex items-center gap-1"
            >
              <CIcon :name="action.icon" class="h-[19px] w-[19px]" />
              <span class="text-[11.5px] font-semibold">{{
                action.count
              }}</span>
            </span>
          </span>
          <CIcon name="bookmark" class="h-[19px] w-[19px]" />
        </div>

        <div class="flex flex-col gap-0.5 px-3 pb-2">
          <span class="text-[11.5px] font-semibold text-[#15151B]">{{
            $t(`${base}.views`)
          }}</span>
          <span class="text-[11px] leading-[15px] text-[#15151B]">
            <span class="font-semibold">{{ $t(`${base}.author`) }}</span>
            {{ " " }}{{ $t(`${base}.caption`) }}
          </span>
        </div>

        <!-- Tab bar -->
        <div
          class="mt-auto flex items-center justify-between px-5 pb-1 pt-2 text-[#15151B]"
        >
          <CIcon name="house" class="h-5 w-5" />
          <CIcon name="search" class="h-5 w-5" />
          <CIcon name="clapperboard" class="h-5 w-5" />
          <CIcon name="send" class="h-5 w-5" />
          <img
            :src="avatarClinic"
            alt=""
            class="h-[21px] w-[21px] rounded-full object-cover ring-[1.5px] ring-[#15151B]"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </CPhoneFrame>

    <!-- What the post earned -->
    <div class="flex w-full min-w-0 flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h4 class="text-[17px] font-semibold tracking-[-0.3px] text-sand-950">
          {{ $t(`${base}.statsTitle`) }}
        </h4>
        <p class="text-[12.5px] text-sand-500">{{ $t(`${base}.statsSub`) }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="tile in tiles"
          :key="tile.label"
          class="flex flex-col gap-2 rounded-2xl border border-sand-200 bg-sand-50 p-3.5"
        >
          <span class="flex items-center justify-between gap-2">
            <CIcon :name="tile.icon" class="h-[15px] w-[15px] text-sand-400" />
            <span
              class="rounded-full bg-signal/10 px-1.5 py-px text-[10.5px] font-semibold text-[#CC3903]"
            >
              {{ tile.delta }}
            </span>
          </span>
          <span class="text-2xl font-bold tracking-[-0.8px] text-sand-950">{{
            tile.value
          }}</span>
          <span class="text-xs text-sand-500">{{ tile.label }}</span>
        </div>
      </div>

      <div
        class="flex flex-col gap-3 rounded-2xl border border-sand-200 bg-sand-50 p-3.5"
      >
        <span class="flex items-center justify-between gap-2">
          <span class="text-[12.5px] font-semibold text-sand-700">
            {{ $t(`${base}.chartTitle`) }}
          </span>
          <span class="text-[12.5px] font-semibold text-signal">
            {{ $t(`${base}.chartTotal`) }}
          </span>
        </span>
        <span class="flex h-[84px] items-end gap-[7px]">
          <span
            v-for="bar in chart"
            :key="bar.day"
            class="flex flex-1 flex-col items-center gap-1.5"
          >
            <span
              class="w-full rounded"
              :class="bar.lit ? 'bg-signal' : 'bg-sand-200'"
              :style="{ height: `${bar.height}px` }"
            />
            <span class="text-[9.5px] text-sand-400">{{ bar.day }}</span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
