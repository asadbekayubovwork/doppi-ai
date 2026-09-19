<script setup lang="ts">
import { CDoppiMark } from "@/shared/ui"

defineProps<{
  entered: boolean
  /** Module whose light is heading in; null keeps the idle pulse. */
  flowIndex: number | null
}>()
</script>

<template>
  <div
    class="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2"
  >
    <div class="hub relative h-full w-full" :class="{ 'is-entered': entered }">
      <span
        v-if="flowIndex === null"
        class="absolute inset-0 animate-pulse-ring rounded-full border border-[#6633EE]/50"
        aria-hidden="true"
      />
      <template v-else>
        <!-- Fires as the travelling light lands, in step with it. -->
        <span
          :key="`flash-${flowIndex}`"
          class="hub-flash absolute -inset-10 rounded-full"
          aria-hidden="true"
        />
        <span
          :key="`ping-${flowIndex}`"
          class="hub-ping absolute inset-0 rounded-full border-2 border-[#8F6BFF]"
          aria-hidden="true"
        />
      </template>

      <div
        class="relative grid h-full w-full place-items-center rounded-full border border-[#6633EE]/50 bg-[#160A2E] text-center shadow-[0_0_60px_-10px_rgba(102,51,238,0.8)]"
      >
        <div class="flex flex-col items-center gap-1.5">
          <CDoppiMark class="h-10 w-10 text-[#8F6BFF]" />
          <span class="text-sm font-bold tracking-tight text-white">
            {{ $t("solution.centerLabel") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The hub is the first thing to pop in once the stage scrolls into view. */
.hub:not(.is-entered) {
  opacity: 0;
}

.hub.is-entered {
  animation: hub-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes hub-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
}

/* The highlight lap (2.4s, see CYCLE_MS in CSolution): the light reaches the
   hub edge around 30%, and the hub answers with a flash and a ring. */

.hub-flash {
  background: radial-gradient(
    closest-side,
    rgba(143, 107, 255, 0.5),
    rgba(102, 51, 238, 0.15) 60%,
    transparent
  );
  animation: hub-flash 2.4s ease-out infinite;
}

@keyframes hub-flash {
  0%,
  28% {
    opacity: 0;
  }
  38% {
    opacity: 1;
  }
  80%,
  100% {
    opacity: 0;
  }
}

.hub-ping {
  animation: hub-ping 2.4s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
}

@keyframes hub-ping {
  0%,
  30% {
    opacity: 0;
    transform: scale(1);
  }
  34% {
    opacity: 0.9;
  }
  80%,
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}
</style>
