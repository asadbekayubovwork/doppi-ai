import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { counterApi } from '../api'

/**
 * Counter store - a simple example of Pinia store usage
 */
export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const lastUpdated = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)
  const formattedLastUpdated = computed(() => {
    if (!lastUpdated.value) return 'Never'
    return new Date(lastUpdated.value).toLocaleString()
  })

  // Actions
  async function fetchCounter() {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await counterApi.getCounter()
      count.value = data.value
      lastUpdated.value = data.lastUpdated
    } catch (err) {
      error.value = 'Failed to fetch counter'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function increment() {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await counterApi.updateCounter({ value: count.value + 1 })
      count.value = data.value
      lastUpdated.value = data.lastUpdated
    } catch (err) {
      error.value = 'Failed to increment counter'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function decrement() {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await counterApi.updateCounter({ value: count.value - 1 })
      count.value = data.value
      lastUpdated.value = data.lastUpdated
    } catch (err) {
      error.value = 'Failed to decrement counter'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function reset() {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await counterApi.resetCounter()
      count.value = data.value
      lastUpdated.value = data.lastUpdated
    } catch (err) {
      error.value = 'Failed to reset counter'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // Initialize the store
  fetchCounter()

  return {
    // State
    count,
    lastUpdated,
    isLoading,
    error,
    
    // Getters
    doubleCount,
    isPositive,
    formattedLastUpdated,
    
    // Actions
    fetchCounter,
    increment,
    decrement,
    reset
  }
})
