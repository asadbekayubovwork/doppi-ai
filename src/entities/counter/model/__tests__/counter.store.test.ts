import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../counter.store'
import { counterApi } from '../../api'

// Mock the counter API
vi.mock('../../api', () => ({
  counterApi: {
    getCounter: vi.fn(),
    updateCounter: vi.fn(),
    resetCounter: vi.fn()
  }
}))

describe('Counter Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance and make it active
    setActivePinia(createPinia())
    
    // Reset mocks
    vi.resetAllMocks()
    
    // Setup default mock implementations
    vi.mocked(counterApi.getCounter).mockResolvedValue({
      value: 0,
      lastUpdated: null
    })
    
    vi.mocked(counterApi.updateCounter).mockImplementation(async (data: { value: number }) => ({
      value: data.value,
      lastUpdated: new Date().toISOString()
    }))
    
    vi.mocked(counterApi.resetCounter).mockResolvedValue({
      value: 0,
      lastUpdated: new Date().toISOString()
    })
  })

  it('should initialize with default state and fetch counter', async () => {
    const store = useCounterStore()
    
    // Initial state before API response
    expect(store.count).toBe(0)
    expect(store.lastUpdated).toBeNull()
    expect(store.isLoading).toBe(true)
    expect(store.error).toBeNull()
    
    // Wait for the API call to resolve
    await vi.waitFor(() => expect(store.isLoading).toBe(false))
    
    // Verify API was called
    expect(counterApi.getCounter).toHaveBeenCalledTimes(1)
  })

  it('should increment the counter via API', async () => {
    const store = useCounterStore()
    
    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(store.isLoading).toBe(false))
    
    // Setup mock for increment
    vi.mocked(counterApi.updateCounter).mockResolvedValueOnce({
      value: 1,
      lastUpdated: new Date().toISOString()
    })
    
    // Increment
    await store.increment()
    
    // Verify state after increment
    expect(store.count).toBe(1)
    expect(store.lastUpdated).not.toBeNull()
    expect(store.doubleCount).toBe(2)
    expect(store.isPositive).toBe(true)
    expect(counterApi.updateCounter).toHaveBeenCalledWith({ value: 1 })
  })

  it('should decrement the counter via API', async () => {
    const store = useCounterStore()
    
    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(store.isLoading).toBe(false))
    
    // Setup mock for decrement
    vi.mocked(counterApi.updateCounter).mockResolvedValueOnce({
      value: -1,
      lastUpdated: new Date().toISOString()
    })
    
    // Decrement
    await store.decrement()
    
    // Verify state after decrement
    expect(store.count).toBe(-1)
    expect(store.lastUpdated).not.toBeNull()
    expect(store.doubleCount).toBe(-2)
    expect(store.isPositive).toBe(false)
    expect(counterApi.updateCounter).toHaveBeenCalledWith({ value: -1 })
  })

  it('should reset the counter via API', async () => {
    const store = useCounterStore()
    
    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(store.isLoading).toBe(false))
    
    // Setup store with non-zero value
    store.count = 5
    
    // Reset
    await store.reset()
    
    // Verify state after reset
    expect(store.count).toBe(0)
    expect(store.lastUpdated).not.toBeNull()
    expect(store.doubleCount).toBe(0)
    expect(store.isPositive).toBe(false)
    expect(counterApi.resetCounter).toHaveBeenCalledTimes(1)
  })
  
  it('should handle API errors', async () => {
    const store = useCounterStore()
    
    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(store.isLoading).toBe(false))
    
    // Setup error mock
    const error = new Error('API error')
    vi.mocked(counterApi.updateCounter).mockRejectedValueOnce(error)
    
    // Attempt increment
    await store.increment()
    
    // Verify error state
    expect(store.error).toBe('Failed to increment counter')
    expect(store.isLoading).toBe(false)
  })
})
