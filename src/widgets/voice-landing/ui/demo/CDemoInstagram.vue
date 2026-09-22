<script setup lang="ts">
import { CIcon } from "@/shared/ui"
import postImage from "@/shared/assets/png/ig-post-clinic.jpg"
import CPhoneFrame from "./CPhoneFrame.vue"

// Step 01: the lead form under an Instagram ad, filled in and about to be sent.
const base = "services.voice.landing.demo.ig"
</script>

<template>
  <CPhoneFrame :label="$t(`${base}.alt`)" screen-class="bg-sand-950">
    <div class="relative flex flex-1 flex-col">
      <!-- Feed -->
      <div class="flex items-center justify-between px-[14px] pb-2.5 pt-1.5">
        <span class="text-[21px] leading-none text-white">Instagram</span>
        <span class="flex items-center gap-3 text-white">
          <CIcon name="heart" class="h-[17px] w-[17px]" />
          <CIcon name="send" class="h-[17px] w-[17px]" />
        </span>
      </div>

      <div class="flex items-center justify-between px-3 py-[7px]">
        <span class="flex items-center gap-2">
          <span
            class="h-7 w-7 rounded-full bg-gradient-to-br from-[#6C5CF5] to-[#B6ABFF]"
          />
          <span class="flex flex-col">
            <span class="text-[12.5px] font-semibold leading-tight text-white"
              >doppi.clinic</span
            >
            <span class="text-[10.5px] leading-tight text-[#A8A8B3]">
              {{ $t(`${base}.caption`) }}
            </span>
          </span>
        </span>
        <CIcon name="ellipsis" class="h-4 w-4 text-white" />
      </div>

      <img
        :src="postImage"
        :alt="$t(`${base}.imageAlt`)"
        class="h-[232px] w-full object-cover"
        loading="lazy"
        decoding="async"
      />

      <div
        class="flex items-center justify-between bg-[#1B1B21] px-[14px] py-[11px]"
      >
        <span class="text-[13px] font-semibold text-white">{{
          $t(`${base}.cta`)
        }}</span>
        <CIcon name="chevron-right" class="h-[15px] w-[15px] text-white" />
      </div>

      <div
        class="flex items-center justify-between px-3 pb-1.5 pt-[11px] text-white"
      >
        <span class="flex items-center gap-3.5">
          <CIcon name="heart" class="h-[18px] w-[18px]" />
          <CIcon name="message-circle" class="h-[18px] w-[18px]" />
          <CIcon name="send" class="h-[18px] w-[18px]" />
        </span>
        <CIcon name="bookmark" class="h-[18px] w-[18px]" />
      </div>

      <div class="flex flex-col gap-1 px-3">
        <span class="text-xs font-semibold text-white">{{
          $t(`${base}.likes`)
        }}</span>
        <span class="text-xs leading-[17px] text-[#D6D6DE]">
          <span class="font-semibold text-white">doppi.clinic</span>
          {{ " " }}{{ $t(`${base}.post`) }}
        </span>
      </div>

      <!-- Lead form sheet -->
      <div class="absolute inset-0 bg-sand-950/70" />

      <div
        class="absolute inset-x-2 bottom-0 flex flex-col gap-[13px] rounded-t-[24px] bg-white px-[18px] pb-[18px] pt-3.5"
      >
        <span class="mx-auto h-1 w-[38px] rounded-full bg-[#D9D9DE]" />

        <div class="flex flex-col gap-1">
          <span class="text-[17px] font-bold tracking-[-0.3px] text-[#15151B]">
            {{ $t(`${base}.sheetTitle`) }}
          </span>
          <span class="text-xs leading-[17px] text-[#6A6A74]">{{
            $t(`${base}.sheetSub`)
          }}</span>
        </div>

        <div
          v-for="field in [
            { label: $t(`${base}.nameLabel`), value: $t(`${base}.nameValue`) },
            {
              label: $t(`${base}.phoneLabel`),
              value: $t(`${base}.phoneValue`),
            },
          ]"
          :key="field.label"
          class="flex flex-col gap-1.5"
        >
          <span class="text-[11px] font-medium text-[#84848E]">{{
            field.label
          }}</span>
          <span
            class="flex items-center justify-between rounded-[10px] border border-[#E5E5E1] bg-[#FAFAF9] px-3 py-[11px]"
          >
            <span class="text-[13.5px] font-medium text-[#15151B]">{{
              field.value
            }}</span>
            <CIcon
              name="check"
              class="h-3.5 w-3.5 text-[#177A46]"
              stroke-width="2.5"
            />
          </span>
        </div>

        <span
          class="flex justify-center rounded-xl bg-[#5B4BE8] py-[13px] text-sm font-semibold text-white"
        >
          {{ $t(`${base}.submit`) }}
        </span>
      </div>
    </div>
  </CPhoneFrame>
</template>
