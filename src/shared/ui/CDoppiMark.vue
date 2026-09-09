<script setup lang="ts">
withDefaults(defineProps<{ strokeWidth?: number | string }>(), {
  strokeWidth: 1.6,
})
</script>

<template>
  <!-- Chust-style doppi (skullcap): the Do'ppi.ai brand mark. Inherits color. -->
  <svg
    viewBox="0 0 52 40"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      d="M8,33 L8,25 C8,17 14,10.5 26,10.5 C38,10.5 44,17 44,25 L44,33 Q44,34.5 42.5,34.5 L9.5,34.5 Q8,34.5 8,33 Z"
    />
    <path d="M8,25 H44" />
    <path d="M9.5,32.5 H42.5" />
    <path
      d="M11,32 V30 H14 V32 H17 V30 H20 V32 H23 V30 H26 V32 H29 V30 H32 V32 H35 V30 H38 V32 H41 V30"
    />
    <path d="M26,11 C21,15 16,20 13.5,25" opacity="0.55" />
    <path d="M26,11 C31,15 36,20 38.5,25" opacity="0.55" />
    <path
      d="M14.5,22 C11,18.5 13,14.8 18,14.3 C22,13.9 23.8,15.6 22.5,18 C21.2,20.4 17.6,22.4 14.5,22 Z"
    />
    <path
      d="M37.5,22 C41,18.5 39,14.8 34,14.3 C30,13.9 28.2,15.6 29.5,18 C30.8,20.4 34.4,22.4 37.5,22 Z"
    />
    <circle cx="15.8" cy="18.6" r="1" fill="currentColor" stroke="none" />
    <circle cx="36.2" cy="18.6" r="1" fill="currentColor" stroke="none" />
    <circle cx="26" cy="13.6" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="24" cy="15.2" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="28" cy="15.2" r="0.5" fill="currentColor" stroke="none" />
  </svg>
</template>
