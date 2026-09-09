<script setup lang="ts">
import { CounterDisplay, useCounterStore } from '@/entities/counter'
import { ref } from 'vue'

const counterStore = useCounterStore()
const showApiDetails = ref(false)
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden max-w-lg mx-auto">
    <div class="bg-blue-50 p-4 border-b border-blue-100">
      <h2 class="text-xl font-semibold text-blue-800 mb-2">Counter Feature Demo</h2>
      <p class="text-sm text-blue-600">
        Advanced counter demo with API integration and state management
      </p>
    </div>
    
    <div class="p-6">
      <CounterDisplay :showControls="true" />
      
      <div class="mt-8 border-t border-gray-100 pt-4">
        <button 
          @click="showApiDetails = !showApiDetails"
          class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <span>{{ showApiDetails ? 'Hide' : 'Show' }} API Details</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 ml-1" 
            :class="{ 'rotate-180': showApiDetails }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div v-if="showApiDetails" class="mt-4 bg-gray-50 p-4 rounded-md text-sm">
          <h3 class="font-medium text-gray-700 mb-2">API Integration Details</h3>
          
          <div class="space-y-2 text-gray-600">
            <p class="flex justify-between">
              <span>Loading State:</span>
              <span 
                :class="{
                  'text-yellow-600': counterStore.isLoading,
                  'text-green-600': !counterStore.isLoading
                }"
              >
                {{ counterStore.isLoading ? 'Loading...' : 'Idle' }}
              </span>
            </p>
            
            <p class="flex justify-between">
              <span>Error State:</span>
              <span 
                :class="{
                  'text-red-600': counterStore.error,
                  'text-green-600': !counterStore.error
                }"
              >
                {{ counterStore.error || 'None' }}
              </span>
            </p>
            
            <p class="flex justify-between">
              <span>Last API Update:</span>
              <span>{{ counterStore.formattedLastUpdated }}</span>
            </p>
          </div>
          
          <div class="mt-4 border-t border-gray-200 pt-4">
            <h4 class="font-medium text-gray-700 mb-2">API Actions</h4>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="counterStore.fetchCounter()"
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                :disabled="counterStore.isLoading"
              >
                Fetch Data
              </button>
              
              <button 
                @click="counterStore.reset()"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                :disabled="counterStore.isLoading"
              >
                Reset Counter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-blue-50 px-4 py-3 border-t border-blue-100">
      <p class="text-xs text-blue-500 text-center">
        This feature demonstrates API integration with loading and error states
      </p>
    </div>
  </div>
</template>
