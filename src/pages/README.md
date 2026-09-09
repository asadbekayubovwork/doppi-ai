# Pages Layer

The Pages Layer contains top-level route components that represent individual pages in your application. Each page is responsible for composing features and widgets to create complete user interfaces.

## 📁 Directory Structure

```
pages/
├── clients/             # Clients section
│   ├── [id].vue        # Client details page (dynamic route)
│   └── index.vue       # Clients list page
├── dashboard/           # Dashboard section
│   └── index.vue       # Main dashboard page
├── settings/            # User settings
│   ├── profile.vue     # Profile settings
│   └── preferences.vue # User preferences
└── index.ts            # Pages export
```

## 🏗 Key Concepts

### 1. Page Components

Page components should:
- Be named using `PascalCase` (e.g., `PClientsList.vue`)
- Handle route parameters and query parameters
- Manage page-level data fetching
- Compose features and widgets
- Handle error boundaries

### 2. Route Configuration

Routes are typically configured in the router setup:

```typescript
{
  path: '/clients',
  name: 'clients',
  component: () => import('@/pages/clients/index.vue'),
  meta: {
    requiresAuth: true,
    title: 'Clients'
  }
}
```

### 3. Data Fetching

Pages should handle data fetching using composition API:

```typescript
// Example: Fetching data in a page component
const { data: clients, pending, error } = useFetch('/api/clients')
```

## 🛠 Best Practices

1. **Keep Pages Thin**
   - Delegate business logic to features
   - Use composition functions for complex logic
   - Keep template focused on layout and composition

2. **Lazy Loading**
   - Use dynamic imports for better code splitting
   - Implement route-based code splitting

3. **Error Handling**
   - Handle API errors gracefully
   - Implement proper loading states
   - Use error boundaries for unexpected errors

4. **SEO & Meta Tags**
   - Set appropriate meta tags
   - Implement proper heading hierarchy
   - Use semantic HTML

## 📱 Responsive Design

Pages should be responsive and work across different screen sizes:

```vue
<template>
  <div class="page-container">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Page content -->
    </div>
  </div>
</template>
```

## 🔄 State Management

For page-specific state, use the Composition API:

```typescript
const usePageState = () => {
  const searchQuery = ref('')
  const filters = reactive({
    status: 'active',
    sortBy: 'name'
  })

  // Computed properties
  const hasActiveFilters = computed(() => {
    return Object.values(filters).some(Boolean)
  })

  return {
    searchQuery,
    filters,
    hasActiveFilters
  }
}
```

## 🔒 Authentication & Authorization

Protect routes using route guards:

```typescript
router.beforeEach((to, from, next) => {
  const isAuthenticated = useAuthStore().isAuthenticated
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})
```
