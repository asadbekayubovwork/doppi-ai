<script setup lang="ts">
import { Toaster } from "vue-sonner"
import "vue-sonner/style.css"
import CIcon from "./CIcon.vue"
</script>

<template>
  <Toaster
    class="doppi-toaster"
    position="top-right"
    close-button-position="top-right"
    rich-colors
    :offset="18"
    :mobile-offset="12"
    :gap="10"
    :visible-toasts="4"
    :toast-options="{ class: 'doppi-toast' }"
    close-button
  >
    <template #success-icon>
      <CIcon name="circle-check" class="h-[18px] w-[18px]" />
    </template>
    <template #error-icon>
      <CIcon name="triangle-alert" class="h-[18px] w-[18px]" />
    </template>
    <template #warning-icon>
      <CIcon name="triangle-alert" class="h-[18px] w-[18px]" />
    </template>
    <template #info-icon>
      <!-- The generated icon set has no `info` glyph; the Lucide geometry is
           inlined here rather than hand-editing the generated files. -->
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    </template>
    <template #close-icon>
      <CIcon name="x" class="h-3.5 w-3.5" />
    </template>
  </Toaster>
</template>

<style>
/* The library ships a neutral grey theme; these variables repaint it with the
   product palette the auth and dashboard surfaces already use. */
.doppi-toaster[data-sonner-toaster] {
  font-family: inherit;
  --width: 380px;
  --border-radius: 12px;
  --normal-bg: #ffffff;
  --normal-border: #e5e5e1;
  --normal-text: #15151b;
  --success-bg: #f3fbf6;
  --success-border: #bfe6cf;
  --success-text: #177a46;
  --error-bg: #fff5f5;
  --error-border: #f3c5c5;
  --error-text: #c42b2b;
  --warning-bg: #fffaef;
  --warning-border: #f0d49a;
  --warning-text: #7a5417;
  --info-bg: #f5f3ff;
  --info-border: #d8d1fa;
  --info-text: #4b21c4;
}

.doppi-toast[data-sonner-toast] {
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  font-size: 13.5px;
  line-height: 1.5;
  box-shadow: 0 12px 32px rgba(16, 17, 26, 0.12);
}

.doppi-toast[data-sonner-toast] [data-title] {
  font-weight: 500;
}

.doppi-toast[data-sonner-toast] [data-icon] {
  margin-top: 1px;
}

.doppi-toast[data-sonner-toast] [data-description] {
  margin-top: 2px;
  font-size: 12.5px;
  opacity: 0.8;
}

.doppi-toast[data-sonner-toast] [data-button] {
  height: 30px;
  border-radius: 8px;
  background: #5b4be8;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 600;
}

/* The library hangs the close button over the toast's corner, so the border
   runs behind it. These rules pull it inside the padding box — nothing to
   bleed through — and centre the glyph. The toaster class is there to outrank
   the library's own selectors. */
.doppi-toaster [data-sonner-toast][data-styled="true"] [data-close-button] {
  --toast-close-button-top: 9px;
  --toast-close-button-right: 9px;
  --toast-close-button-bottom: unset;
  --toast-close-button-left: unset;
  --toast-close-button-transform: none;
  display: grid;
  place-items: center;
  height: 22px;
  width: 22px;
  padding: 0;
  background: var(--normal-bg);
  border-color: currentColor;
  color: inherit;
  opacity: 0.45;
}

/* Rich colours tint the toast itself, so the button carries the same fill and
   disappears into the surface behind the glyph. */
.doppi-toaster
  [data-sonner-toast][data-styled="true"][data-type="success"]
  [data-close-button] {
  background: var(--success-bg);
}

.doppi-toaster
  [data-sonner-toast][data-styled="true"][data-type="error"]
  [data-close-button] {
  background: var(--error-bg);
}

.doppi-toaster
  [data-sonner-toast][data-styled="true"][data-type="warning"]
  [data-close-button] {
  background: var(--warning-bg);
}

.doppi-toaster
  [data-sonner-toast][data-styled="true"][data-type="info"]
  [data-close-button] {
  background: var(--info-bg);
}

.doppi-toaster [data-sonner-toast][data-styled="true"] [data-close-button] svg {
  display: block;
  margin: 0;
}

.doppi-toaster
  [data-sonner-toast][data-styled="true"]:hover
  [data-close-button]:hover {
  border-color: currentColor;
  opacity: 1;
}

/* Keep a long title from running under the button. */
.doppi-toast[data-sonner-toast] [data-content] {
  padding-right: 20px;
}
</style>
