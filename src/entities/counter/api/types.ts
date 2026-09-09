/**
 * Counter API types
 */

export interface CounterDTO {
  value: number
  lastUpdated: string | null
}

export interface CounterUpdateDTO {
  value: number
}

export interface CounterResponse {
  data: CounterDTO
  status: 'success' | 'error'
}
