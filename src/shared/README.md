# Shared Layer

The Shared Layer contains reusable utilities, components, and configurations that are used across the entire application. This layer helps maintain consistency and reduces code duplication.

## 📁 Directory Structure

```
shared/
├── api/                    # API clients and interceptors
│   ├── http.ts             # HTTP client configuration
│   ├── interceptors/        # Request/response interceptors
│   └── types.ts             # API types
├── assets/                 # Static assets
│   ├── icons/              # SVG icons
│   └── images/             # Image assets
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   └── ...
│   └── layout/             # Layout components
├── config/                 # Application configuration
│   ├── app.ts              # App settings
│   └── env.ts              # Environment variables
├── constants/              # Application constants
│   ├── routes.ts           # Route names and paths
│   └── index.ts            # Common constants
├── hooks/                  # Composable functions
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── ...
├── lib/                   # Utility libraries
│   ├── date.ts             # Date utilities
│   ├── formatters.ts       # Text formatting
│   └── validators.ts       # Validation utilities
├── styles/                 # Global styles
│   ├── base/               # Base styles
│   ├── components/         # Component styles
│   └── utils/              # Utility classes
└── types/                  # Global TypeScript types
    ├── global.d.ts         # Global type declarations
    └── index.ts            # Type exports
```

## 🏗 Key Components

### 1. API Client

Centralized HTTP client with interceptors:

```typescript
// shared/api/http.ts
import axios from 'axios'
import { useAuthStore } from '@/features/auth/model/auth.store'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
http.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error)
  }
)

export { http }
```

### 2. UI Components

Reusable UI components with consistent styling:

```vue
<!-- shared/components/ui/Button/Button.vue -->
<template>
  <button
    :class="[
      'button',
      `button--${variant}`,
      { 'button--disabled': disabled },
      { 'button--loading': loading }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="button__loader">
      <LoadingSpinner />
    </span>
    <span v-else class="button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'

defineProps({
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'danger' | 'text'>,
    default: 'primary',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
```

### 3. Hooks

Reusable composition functions:

```typescript
// shared/hooks/useDebounce.ts
import { ref, watch, onUnmounted } from 'vue'

export function useDebounce<T>(value: T, delay = 300) {
  const debouncedValue = ref<T>(value)
  let timeoutId: ReturnType<typeof setTimeout>

  const updateDebouncedValue = (newValue: T) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  }


  watch(
    () => value,
    (newValue) => {
      updateDebouncedValue(newValue)
    },
    { immediate: true }
  )

  onUnmounted(() => {
    clearTimeout(timeoutId)
  })

  return debouncedValue
}
```

## 🛠 Best Practices

1. **Reusability**
   - Components should be truly reusable
   - Avoid business logic in shared components
   - Use props for configuration

2. **Type Safety**
   - Use TypeScript for all shared code
   - Export types from shared types
   - Use generics for flexible components

3. **Testing**
   - Unit test all utilities
   - Add component tests for UI components
   - Test edge cases

4. **Documentation**
   - Document component props and events
   - Add JSDoc comments to utilities
   - Include usage examples

## 🔧 Utilities

### Date Formatting

```typescript
// shared/lib/date.ts
import { format } from 'date-fns'

export function formatDate(date: string | Date, formatStr = 'PP'): string {
  if (!date) return ''
  return format(new Date(date), formatStr)
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'PP pp')
}
```

### Form Validation

```typescript
// shared/lib/validators.ts
export const required = (value: unknown) => {
  if (Array.isArray(value)) return !!value.length
  if (value === undefined || value === null) return false
  if (value === false) return true
  if (value instanceof Date) return true
  if (typeof value === 'object') {
    for (const _ in value as object) return true
    return false
  }
  return !!String(value).trim().length
}

export const email = (value: string) => {
  if (!value) return true
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || 'Invalid email format'
}

export const minLength = (length: number) => {
  return (value: string) => {
    if (!value) return true
    return (
      value.length >= length ||
      `Must be at least ${length} characters`
    )
  }
}
```

## 🎨 Styling

### Global Styles

```scss
// shared/styles/base/_variables.scss
:root {
  // Colors
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  // Typography
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  // Spacing
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-8: 2rem;
}
```

### Utility Classes

```scss
// shared/styles/utils/_flex.scss
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-4 {
  gap: var(--spacing-4);
}
```
