<script setup lang="ts">
import { CounterDisplay } from '@/entities/counter'
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden max-w-md mx-auto"
    data-aos="fade-up"
    data-aos-duration="1000"
  >
    <div
      class="bg-gray-100 p-4 border-b border-gray-200"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="100"
    >
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Counter Demo</h2>
      <p class="text-sm text-gray-600">
        A simple counter widget demonstrating Pinia store with API integration
      </p>
    </div>
    
    <div
      class="p-6"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="200"
    >
      <CounterDisplay :showControls="true" />
    </div>
    
    <div
      class="bg-gray-50 px-4 py-3 border-t border-gray-200"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="300"
    >
      <p class="text-xs text-gray-400 text-center">
        This widget demonstrates the FSD architecture with entities and widgets layers
      </p>
    </div>
  </div>
</template>


