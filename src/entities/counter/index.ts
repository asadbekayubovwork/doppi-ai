// Export the counter store
export { useCounterStore } from './model/counter.store'

// Export UI components
export { default as CounterDisplay } from './ui/CounterDisplay.vue'

// Export API layer
export { counterApi } from './api'
export type * from './api/types'
