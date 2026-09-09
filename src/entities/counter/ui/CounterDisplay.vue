<script setup lang="ts">
import { useCounterStore } from '../model/counter.store'

const props = defineProps<{
  showControls?: boolean
}>()

const counterStore = useCounterStore()
</script>

<template>
  <div class="p-4 rounded-lg bg-white shadow-sm max-w-xs mx-auto min-h-[150px] flex flex-col">
    <div v-if="counterStore.isLoading" class="flex items-center justify-center h-24 text-gray-500 italic">
      Loading...
    </div>
    
    <div v-else-if="counterStore.error" class="p-4 bg-red-100 text-red-700 rounded-md mb-4 text-center flex flex-col gap-2">
      {{ counterStore.error }}
      <button 
        class="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors mt-2 self-center"
        @click="counterStore.fetchCounter"
      >
        Retry
      </button>
    </div>
    
    <template v-else>
      <div 
        class="text-5xl font-bold text-center mb-4"
        :class="{ 'text-emerald-600': counterStore.isPositive, 'text-red-600': !counterStore.isPositive }"
      >
        {{ counterStore.count }}
      </div>
      
      <div v-if="props.showControls" class="flex justify-center gap-2 mb-4">
        <button 
          class="px-4 py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          @click="counterStore.decrement"
          aria-label="Decrement counter"
          :disabled="counterStore.isLoading"
        >
          -
        </button>
        <button 
          class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          @click="counterStore.reset"
          aria-label="Reset counter"
          :disabled="counterStore.isLoading"
        >
          Reset
        </button>
        <button 
          class="px-4 py-2 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          @click="counterStore.increment"
          aria-label="Increment counter"
          :disabled="counterStore.isLoading"
        >
          +
        </button>
      </div>
      
      <div class="text-sm text-gray-500 text-center mt-auto">
        <p>Double value: {{ counterStore.doubleCount }}</p>
        <p>
          Last updated: {{ counterStore.formattedLastUpdated }}
        </p>
      </div>
    </template>
  </div>
</template>


