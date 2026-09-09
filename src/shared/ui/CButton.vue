<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    class="transition-300 font-medium rounded-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
    :aria-busy="loading"
    :aria-disabled="disabled || loading"
  >
    <span
      v-if="icon && iconPosition === 'left'"
      :class="icon"
      aria-hidden="true"
    ></span>
    {{ label }}
    <span
      v-if="icon && iconPosition === 'right'"
      :class="icon"
      aria-hidden="true"
    ></span>
    <span v-if="loading" class="ml-2 loading-spinner" aria-hidden="true"></span>
  </button>
</template>

<script setup lang="ts">
// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
import { computed } from "vue"

// -----------------------------------------------------------------------------
// Props & Emits
// -----------------------------------------------------------------------------
interface Props {
  /**
   * The type of the button. Can be 'button', 'submit', or 'reset'.
   * @default 'button'
   */
  type?: "button" | "submit" | "reset"

  /**
   * The text to display on the button.
   */
  label: string

  /**
   * The visual style variant of the button.
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "danger" | "ghost"

  /**
   * The size of the button.
   * @default 'medium'
   */
  size?: "small" | "medium" | "large"

  /**
   * Whether the button is disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the button is in a loading state.
   * @default false
   */
  loading?: boolean

  /**
   * Optional icon class name (e.g., from an icon library).
   */
  icon?: string

  /**
   * The position of the icon relative to the label.
   * @default 'left'
   */
  iconPosition?: "left" | "right"
}

const props = withDefaults(defineProps<Props>(), {
  type: "button",
  variant: "primary",
  size: "medium",
  disabled: false,
  loading: false,
  iconPosition: "left",
})

// -----------------------------------------------------------------------------
// Computed Properties
// -----------------------------------------------------------------------------

/**
 * Button variant styles mapping.
 * Defines the visual appearance based on the selected variant.
 */
const variantClasses = {
  primary:
    "bg-primary-60 text-white hover:bg-primary-80 focus-visible:ring-2 focus-visible:ring-primary-60 focus-visible:ring-opacity-50 disabled:bg-secondary-20 disabled:text-secondary-60",
  secondary:
    "bg-secondary-10 text-secondary-100 hover:bg-secondary-20 focus-visible:ring-2 focus-visible:ring-secondary-60 focus-visible:ring-opacity-50",
  danger:
    "bg-danger-60 text-white hover:bg-danger-70 focus-visible:ring-2 focus-visible:ring-danger-60 focus-visible:ring-opacity-50",
  ghost:
    "bg-transparent text-primary-60 hover:bg-secondary-10 focus-visible:ring-2 focus-visible:ring-primary-60 focus-visible:ring-opacity-50",
}

/**
 * Button size styles mapping.
 * Defines the size-related styles based on the selected size.
 */
const sizeClasses = {
  small: "text-sm leading-125 py-3 px-3",
  medium: "text-base py-3 px-4",
  large: "text-lg py-4 px-6",
}

/**
 * Combined button classes computed property.
 * Merges variant, size, and loading states into a single class string.
 */
const classes = computed(() => {
  const variant = variantClasses[props.variant] || variantClasses.primary
  const size = sizeClasses[props.size] || sizeClasses.medium
  const loading = props.loading ? "opacity-50 cursor-wait" : ""
  const disabled = props.disabled ? "cursor-not-allowed" : ""

  return [variant, size, loading, disabled].filter(Boolean)
})
</script>

<style scoped>
/**
 * Loading spinner animation for the loading state
 */
.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin;
}
</style>
