# Widgets Layer

The Widgets Layer contains self-contained, reusable UI components that combine multiple entities and features to create meaningful user interface blocks. Widgets are more complex than basic UI components and often include their own state and business logic.

## 📁 Directory Structure

```
widgets/
├── client-profile/           # Client profile widget
│   ├── ClientProfile.vue     # Main component
│   ├── ClientDetails.vue     # Client details section
│   ├── ClientActions.vue      # Action buttons
│   └── index.ts              # Widget export
├── data-table/               # Data table widget
│   ├── DataTable.vue         # Main component
│   ├── TableHeader.vue       # Table header
│   ├── TableRow.vue          # Table row
│   └── index.ts              # Widget export
└── index.ts                  # Widgets export
```

## 🏗 Key Concepts

### 1. Widget Structure

Each widget should be self-contained and include:
- Main component
- Sub-components (if needed)
- Local state management
- Type definitions
- Index file for clean imports

### 2. When to Use Widgets

Use widgets when you need to:
- Combine multiple entities/features
- Create reusable UI blocks with behavior
- Encapsulate complex UI logic
- Reuse the same UI across different pages

### 3. Props and Events

Widgets should communicate through:
- **Props** for configuration
- **Events** for user interactions
- **Slots** for flexible content
- **Provide/Inject** for deep component communication

## 🛠 Implementation Example

### Client Profile Widget

```vue
<!-- widgets/client-profile/ClientProfile.vue -->
<template>
  <div class="client-profile">
    <ClientHeader 
      :client="client"
      @edit="handleEdit"
    />
    <ClientDetails 
      :client="client" 
      :loading="isLoading"
    />
    <ClientActions 
      :client-id="client.id"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useClientStore } from '@/entities/client/model/client.store'
import ClientHeader from './ClientHeader.vue'
import ClientDetails from './ClientDetails.vue'
import ClientActions from './ClientActions.vue'

const props = defineProps<{
  clientId: string
}>()

const emit = defineEmits<{
  (e: 'edit', client: Client): void
  (e: 'delete', id: string): void
}>()

const clientStore = useClientStore()
const isLoading = ref(false)
const client = ref<Client | null>(null)

const fetchClient = async () => {
  try {
    isLoading.value = true
    client.value = await clientStore.getClient(props.clientId)
  } catch (error) {
    console.error('Failed to fetch client:', error)
  } finally {
    isLoading.value = false
  }
}

const handleEdit = () => {
  if (client.value) {
    emit('edit', client.value)
  }
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this client?')) {
    emit('delete', props.clientId)
  }
}

onMounted(() => {
  fetchClient()
})
</script>
```

## 🛠 Best Practices

1. **Composition**
   - Compose widgets from smaller components
   - Keep widget responsibilities focused
   - Use slots for flexible content

2. **State Management**
   - Use Pinia for global state
   - Use local state for UI state
   - Keep state minimal and derived

3. **Performance**
   - Implement lazy loading
   - Use `v-memo` for expensive renders
   - Debounce input handlers

4. **Accessibility**
   - Follow WAI-ARIA guidelines
   - Add keyboard navigation
   - Ensure proper focus management

## 🔄 Data Flow

1. **Data Loading**
   - Widgets fetch their own data
   - Use loading and error states
   - Handle edge cases

2. **User Interactions**
   - Emit events for actions
   - Handle success/error states
   - Provide feedback

## 📱 Responsive Design

Widgets should be responsive and adapt to different screen sizes:

```vue
<template>
  <div class="widget-container">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ClientCard 
        v-for="client in clients" 
        :key="client.id"
        :client="client"
      />
    </div>
  </div>
</template>

<style scoped>
.widget-container {
  @apply p-4 bg-white rounded-lg shadow;
}

@media (max-width: 768px) {
  .widget-container {
    @apply p-2;
  }
}
</style>
```

## 🧪 Testing

Test widgets in isolation:

```typescript
// widgets/client-profile/__tests__/ClientProfile.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ClientProfile from '../ClientProfile.vue'

describe('ClientProfile', () => {
  it('fetches client data on mount', async () => {
    const mockClient = { id: '1', name: 'Test Client' }
    const mockGetClient = vi.fn().mockResolvedValue(mockClient)
    
    const wrapper = mount(ClientProfile, {
      props: { clientId: '1' },
      global: {
        provide: {
          [CLIENT_STORE_KEY]: {
            getClient: mockGetClient
          }
        }
      }
    })
    
    expect(mockGetClient).toHaveBeenCalledWith('1')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.client-name').text()).toBe('Test Client')
  })
})
```

## 🔒 Security Considerations

- Sanitize user input
- Validate props
- Handle errors gracefully
- Protect sensitive data
