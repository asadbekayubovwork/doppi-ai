import { useToast } from "./useToast"

/**
 * Copies text and reports the outcome as a toast, so every "copy" control in
 * the dashboard gives the same feedback — including when the clipboard API is
 * blocked (insecure origin, denied permission).
 */
export function useCopyToClipboard() {
  const toast = useToast()

  return async (text: string, successTitle = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successTitle, text)
      return true
    } catch {
      toast.error("Couldn't copy", "Select the text and copy it manually.")
      return false
    }
  }
}
