import { useI18n } from "vue-i18n"
import { useToast } from "./useToast"

/**
 * Copies text and reports the outcome as a toast, so every "copy" control in
 * the dashboard gives the same feedback — including when the clipboard API is
 * blocked (insecure origin, denied permission).
 */
export function useCopyToClipboard() {
  const toast = useToast()
  const { t } = useI18n()

  return async (text: string, successTitle = t("dashboard.common.copied")) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successTitle, text)
      return true
    } catch {
      toast.error(t("dashboard.common.copyFailed"), t("dashboard.common.copyFailedHint"))
      return false
    }
  }
}
