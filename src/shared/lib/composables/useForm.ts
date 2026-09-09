import {
  reactive,
  computed,
  readonly,
  type DeepReadonly,
  type ToRefs,
  toRefs,
} from "vue"
import {
  useVuelidate,
  type Validation,
  type ValidationRuleCollection,
} from "@vuelidate/core"
import { useToast, type TYPE } from "vue-toast-notification"

// Define the return type of the composable
export interface UseForm<T extends FormState> {
  formData: ToRefs<DeepReadonly<T>>
  formState: T
  v$: Validation
  isSubmitting: Readonly<boolean>
  isValid: Readonly<boolean> // Still useful for conditional logic, e.g. enabling submit button initially
  // hasErrors, errors, getFieldErrors are less critical for UI if only using toasts,
  // but can be kept for debugging or programmatic access.
  handleSubmit: (
    submitFn: (data: T) => Promise<void> | void,
    successMessage?: string
  ) => Promise<void>
  resetForm: () => void
  touchField: (fieldName: keyof T) => void // Kept for triggering Vuelidate's internal state
}

export function useForm<T extends FormState>(
  initialValues: T,
  rules: ValidationRuleCollection<T>,
  // eslint-disable-next-line
  validationOptions?: any
): UseForm<T> {
  // --- Toast Instance ---
  const $toast = useToast()

  // --- State ---
  const formState = reactive<T>({ ...initialValues })
  const isSubmitting = reactive({ value: false })

  // --- Vuelidate Integration ---
  const v$ = useVuelidate(rules, formState, validationOptions)

  // --- Computed Properties ---
  const isValid = computed(() => !v$.value.$invalid)

  // --- Methods ---

  /**
   * Handles form submission.
   * Validates the form. If invalid, shows toast notifications for errors.
   * If valid, executes the provided submit function and shows a success/error toast.
   * @param submitFn - The function to execute on successful validation.
   * @param successMessage - Optional custom message for success toast.
   */
  const handleSubmit = async (
    submitFn: (data: T) => Promise<void> | void,
    successMessage: string = "Form submitted successfully!" // Default success message
  ): Promise<void> => {
    isSubmitting.value = true
    v$.value.$touch() // Mark all fields as touched to populate Vuelidate's $errors

    if (v$.value.$invalid) {
      // Iterate over Vuelidate errors and show a toast for each
      v$.value.$errors.forEach((error) => {
        $toast.open({
          message: error.$message as string,
          type: TYPE.ERROR, // Or 'error'
        })
      })
      // You might want a slight delay or ensure toasts are queued if many appear
      console.warn("Form is invalid. Submission prevented. Toasts shown.")
      isSubmitting.value = false
      return // Prevent submission
    }

    // If form is valid, proceed with submission
    try {
      await submitFn(JSON.parse(JSON.stringify(formState))) // Pass a deep copy of formState
      $toast.open({
        message: successMessage,
        type: TYPE.SUCCESS, // Or 'success'
      })
      // eslint-disable-next-line
    } catch (e: any) {
      console.error("Submission error:", e)
      $toast.open({
        message: e.message || "An error occurred during submission.",
        type: TYPE.ERROR,
      })
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Resets the form to its initial values and clears validation state.
   */
  const resetForm = (): void => {
    const freshInitialValues = { ...initialValues }
    for (const key in formState) {
      delete formState[key]
    }
    Object.assign(formState, freshInitialValues)
    v$.value.$reset()
    isSubmitting.value = false
    // $toast.info("Form has been reset."); // Optional: toast on reset
  }

  /**
   * Manually marks a field as touched.
   * Does NOT trigger toasts here to avoid excessive notifications.
   * Vuelidate's internal state is updated, which is used by handleSubmit.
   * @param fieldName - The name of the field to touch.
   */
  const touchField = (fieldName: keyof T): void => {
    const field = v$.value[fieldName as string]
    if (field) {
      field.$touch()
    }
  }

  return {
    formData: toRefs(readonly(formState)),
    formState,
    v$: v$.value,
    isSubmitting: readonly(isSubmitting).value,
    isValid: readonly(isValid).value, // Still useful
    handleSubmit,
    resetForm,
    touchField,
  }
}
