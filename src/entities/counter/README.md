# Counter Entity

A simple counter entity that demonstrates Pinia store implementation with Vue 3 Composition API and API layer integration.

## Structure

```
counter/
├── api/                # API layer
│   ├── counterApi.ts    # API client for counter
│   ├── types.ts         # API types and DTOs
│   └── index.ts         # API public exports
├── model/              # Business logic
│   └── counter.store.ts  # Pinia store for counter
├── ui/                 # UI components
│   └── CounterDisplay.vue # Counter display component
└── index.ts            # Public API
```

## Usage

```vue
<script setup>
import { CounterDisplay, useCounterStore } from '@/entities/counter'

// Access the store directly if needed
const counterStore = useCounterStore()
</script>

<template>
  <!-- Basic usage -->
  <CounterDisplay />
  
  <!-- With controls -->
  <CounterDisplay :showControls="true" />
  
  <!-- Access store state directly -->
  <div>Current count: {{ counterStore.count }}</div>
</template>
```

## Store Features

- **State**: `count`, `lastUpdated`, `isLoading`, `error`
- **Getters**: `doubleCount`, `isPositive`, `formattedLastUpdated`
- **Actions**: `fetchCounter()`, `increment()`, `decrement()`, `reset()`
- **API Integration**: All actions communicate with the API layer
- **Loading States**: Proper loading and error handling

## API Layer

- **API Client**: Mock implementation that simulates real API calls
- **Types**: Proper TypeScript types and DTOs for API requests/responses
- **Methods**: `getCounter()`, `updateCounter()`, `resetCounter()`
- **Persistence**: Data is stored in localStorage to simulate a backend
