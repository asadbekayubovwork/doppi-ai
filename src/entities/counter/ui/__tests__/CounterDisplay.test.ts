import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

// Note: TypeScript errors in test files are expected and can be ignored
// The tests will still run correctly despite the TypeScript errors
import CounterDisplay from '../CounterDisplay.vue'
import { useCounterStore } from '../../model/counter.store'

describe('CounterDisplay', () => {
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = ''
  })

  it('renders the counter value when not loading', async () => {
    const wrapper = mount(CounterDisplay, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              count: 0,
              isLoading: false,
              error: null
            }
          }
        })]
      }
    })
    
    const counterStore = useCounterStore()
    
    // Initial state
    expect(wrapper.find('.text-5xl').text()).toBe('0')
    
    // Update the store
    counterStore.count = 5
    await wrapper.vm.$nextTick() // Wait for the DOM to update
    expect(wrapper.find('.text-5xl').text()).toBe('5')
  })

  it('shows loading state when isLoading is true', () => {
    const wrapper = mount(CounterDisplay, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: true,
              error: null
            }
          }
        })]
      }
    })
    
    expect(wrapper.find('.text-gray-500.italic').exists()).toBe(true)
    expect(wrapper.find('.text-5xl').exists()).toBe(false)
  })

  it('shows error state when error is present', () => {
    const errorMessage = 'Failed to load counter'
    const wrapper = mount(CounterDisplay, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: false,
              error: errorMessage
            }
          }
        })]
      }
    })
    
    expect(wrapper.find('.bg-red-100.text-red-700').exists()).toBe(true)
    expect(wrapper.find('.bg-red-100.text-red-700').text()).toContain(errorMessage)
    expect(wrapper.find('.text-5xl').exists()).toBe(false)
  })

  it('calls fetchCounter when retry button is clicked', async () => {
    const wrapper = mount(CounterDisplay, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: false,
              error: 'Some error'
            }
          },
          createSpy: vi.fn
        })]
      }
    })
    
    const counterStore = useCounterStore()
    
    await wrapper.find('.bg-blue-100.text-blue-700').trigger('click')
    expect(counterStore.fetchCounter).toHaveBeenCalledTimes(1)
  })

  it('shows controls when showControls prop is true', () => {
    const wrapper = mount(CounterDisplay, {
      props: {
        showControls: true
      },
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: false,
              error: null
            }
          }
        })]
      }
    })
    
    expect(wrapper.find('.flex.justify-center.gap-2').exists()).toBe(true)
    expect(wrapper.find('.bg-emerald-100').exists()).toBe(true)
    expect(wrapper.find('.bg-red-100').exists()).toBe(true)
    expect(wrapper.find('.bg-gray-100').exists()).toBe(true)
  })

  it('hides controls when showControls prop is false', () => {
    const wrapper = mount(CounterDisplay, {
      props: {
        showControls: false
      },
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: false,
              error: null
            }
          }
        })]
      }
    })
    
    expect(wrapper.find('.flex.justify-center.gap-2').exists()).toBe(false)
  })

  it('calls increment when + button is clicked', async () => {
    const wrapper = mount(CounterDisplay, {
      props: {
        showControls: true
      },
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: false,
              error: null
            }
          },
          createSpy: vi.fn
        })]
      }
    })
    
    const counterStore = useCounterStore()
    
    await wrapper.find('.bg-emerald-100').trigger('click')
    expect(counterStore.increment).toHaveBeenCalledTimes(1)
  })

  it('calls decrement when - button is clicked', async () => {
    const wrapper = mount(CounterDisplay, {
      props: {
        showControls: true
      },
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: false,
              error: null
            }
          },
          createSpy: vi.fn
        })]
      }
    })
    
    const counterStore = useCounterStore()
    
    await wrapper.find('.bg-red-100').trigger('click')
    expect(counterStore.decrement).toHaveBeenCalledTimes(1)
  })

  it('calls reset when Reset button is clicked', async () => {
    const wrapper = mount(CounterDisplay, {
      props: {
        showControls: true
      },
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: false,
              error: null
            }
          },
          createSpy: vi.fn
        })]
      }
    })
    
    const counterStore = useCounterStore()
    
    await wrapper.find('.bg-gray-100').trigger('click')
    expect(counterStore.reset).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when loading', () => {
    const wrapper = mount(CounterDisplay, {
      props: {
        showControls: true
      },
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              isLoading: true,
              error: null
            }
          }
        })]
      }
    })
    
    // Buttons should not be visible when loading
    expect(wrapper.find('.flex.justify-center.gap-2').exists()).toBe(false)
  })

  it('shows last updated time section', () => {
    const wrapper = mount(CounterDisplay, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              count: 0,
              isLoading: false,
              error: null,
              lastUpdated: new Date('2023-01-01T12:00:00Z').toISOString()
            }
          }
        })]
      }
    })
    
    // Just verify that the last updated section exists and contains some text
    const infoSection = wrapper.find('.text-sm.text-gray-500')
    expect(infoSection.exists()).toBe(true)
    expect(infoSection.text()).toContain('Last updated:')
  })

  it('shows "Never" when lastUpdated is null', () => {
    const wrapper = mount(CounterDisplay, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            counter: {
              count: 0,
              isLoading: false,
              error: null,
              lastUpdated: null
            }
          }
        })]
      }
    })
    
    // Verify that the last updated section shows "Never" when lastUpdated is null
    const infoSection = wrapper.find('.text-sm.text-gray-500')
    expect(infoSection.exists()).toBe(true)
    expect(infoSection.text()).toContain('Last updated: Never')
  })
})
