# Entities Layer

The Entities Layer contains core business models and their associated logic. Entities represent the fundamental building blocks of your application's domain model and are reusable across multiple features.

## 📁 Directory Structure

```
entities/
├── client/                    # Client entity
│   ├── api/                   # API integration
│   │   ├── clientApi.ts       # API methods
│   │   └── types.ts           # TypeScript types
│   ├── model/                 # Business logic
│   │   ├── client.store.ts    # Pinia store
│   │   └── types.ts           # Local types
│   ├── ui/                    # UI components
│   │   ├── ClientCard.vue     # Client card component
│   │   └── ClientForm.vue     # Client form component
│   └── index.ts               # Public API
├── user/                      # User entity
│   ├── api/
│   ├── model/
│   ├── ui/
│   └── index.ts
└── index.ts                   # Entities export
```

## 🏗 Key Concepts

### 1. Entity Structure

Each entity should be self-contained and include:
- `api/`: API integration
- `model/`: Business logic and state management
- `ui/`: Reusable UI components
- `index.ts`: Public API

### 2. Business Logic

Encapsulate business rules in the model layer:

```typescript
// entities/client/model/client.store.ts
import { defineStore } from 'pinia'

export const useClientStore = defineStore('client', {
  state: () => ({
    clients: [],
    currentClient: null,
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchClients(params = {}) {
      this.isLoading = true
      try {
        const { data } = await clientApi.getClients(params)
        this.clients = data
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async createClient(clientData) {
      try {
        const { data } = await clientApi.createClient(clientData)
        this.clients.unshift(data)
        return data
      } catch (error) {
        this.error = error
        throw error
      }
    }
  },
  
  getters: {
    activeClients: (state) => {
      return state.clients.filter(client => client.status === 'active')
    },
    
    getClientById: (state) => (id) => {
      return state.clients.find(client => client.id === id)
    }
  }
})
```

### 3. API Layer

Keep API calls in dedicated files:

```typescript
// entities/client/api/clientApi.ts
import { apiClient } from '@/shared/api'
import type { Client, CreateClientDto, UpdateClientDto } from './types'

export const clientApi = {
  async getClients(params = {}): Promise<Client[]> {
    const { data } = await apiClient.get('/clients', { params })
    return data
  },
  
  async getClient(id: string): Promise<Client> {
    const { data } = await apiClient.get(`/clients/${id}`)
    return data
  },
  
  async createClient(clientData: CreateClientDto): Promise<Client> {
    const { data } = await apiClient.post('/clients', clientData)
    return data
  },
  
  async updateClient(id: string, clientData: UpdateClientDto): Promise<Client> {
    const { data } = await apiClient.put(`/clients/${id}`, clientData)
    return data
  },
  
  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`)
  }
}
```

## 🛠 Best Practices

1. **Single Responsibility**
   - Each entity should have a single responsibility
   - Keep entities focused on their domain
   - Avoid business logic in UI components

2. **Type Safety**
   - Define TypeScript interfaces for all data structures
   - Use type guards for runtime type checking
   - Keep API types in sync with the backend

3. **State Management**
   - Use Pinia for global state
   - Keep state normalized
   - Use getters for derived state

4. **Testing**
   - Unit test business logic
   - Test API integration
   - Test edge cases

## 🔄 Data Flow

1. **Data Loading**
   - Features trigger data loading
   - Entities handle API calls
   - State is updated automatically

2. **Data Mutation**
   - Components trigger actions
   - Entities update state
   - UI updates automatically

## 📱 UI Components

Entity-specific UI components should be:
- Reusable
- Presentational
- Unaware of business logic
- Responsive

Example:

```vue
<template>
  <div class="client-card">
    <div class="client-card__header">
      <h3>{{ client.name }}</h3>
      <ClientStatusBadge :status="client.status" />
    </div>
    <div class="client-card__body">
      <p>{{ client.description }}</p>
      <div class="client-card__meta">
        <span>Created: {{ formatDate(client.createdAt) }}</span>
      </div>
    </div>
    <div class="client-card__actions">
      <button @click="$emit('edit', client)">Edit</button>
      <button @click="$emit('delete', client.id)">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Client } from '../types'

defineProps<{
  client: Client
}>()

defineEmits<{
  (e: 'edit', client: Client): void
  (e: 'delete', id: string): void
}>()
</script>
```
