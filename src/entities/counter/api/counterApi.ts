import type { CounterDTO, CounterUpdateDTO } from './types'

/**
 * Counter API client
 * This is a mock API client that simulates API calls for the counter entity
 */
export const counterApi = {
  /**
   * Get counter value
   */
  async getCounter(): Promise<CounterDTO> {
    // In a real app, this would be an API call
    // return http.get<CounterResponse>('/counter').then(res => res.data.data)
    
    // For demo purposes, we'll simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const savedValue = localStorage.getItem('counter')
        const savedLastUpdated = localStorage.getItem('counter_lastUpdated')
        
        resolve({
          value: savedValue ? parseInt(savedValue, 10) : 0,
          lastUpdated: savedLastUpdated || null
        })
      }, 100) // Simulate network delay
    })
  },

  /**
   * Update counter value
   */
  async updateCounter(data: CounterUpdateDTO): Promise<CounterDTO> {
    // In a real app, this would be an API call
    // return http.put<CounterResponse>('/counter', data).then(res => res.data.data)
    
    // For demo purposes, we'll simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString()
        localStorage.setItem('counter', data.value.toString())
        localStorage.setItem('counter_lastUpdated', now)
        
        resolve({
          value: data.value,
          lastUpdated: now
        })
      }, 100) // Simulate network delay
    })
  },

  /**
   * Reset counter value
   */
  async resetCounter(): Promise<CounterDTO> {
    // In a real app, this would be an API call
    // return http.post<CounterResponse>('/counter/reset').then(res => res.data.data)
    
    // For demo purposes, we'll simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString()
        localStorage.setItem('counter', '0')
        localStorage.setItem('counter_lastUpdated', now)
        
        resolve({
          value: 0,
          lastUpdated: now
        })
      }, 100) // Simulate network delay
    })
  }
}
