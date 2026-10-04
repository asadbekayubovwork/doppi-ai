import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { COMPANY, incorporatedYear } from "@/shared/config/company"

/**
 * The operating company in the interface language: `"ADS AI AUTOMATION" MChJ`
 * or `ADS AI AUTOMATION LLC`, its registered address, and "STIR: …" once the
 * tax ID is filled in (empty until then, so callers can skip it).
 */
export function useCompany() {
  const { t } = useI18n()

  const legalName = computed(() => t("company.legalName", { name: COMPANY.name }))
  const address = computed(() => t("company.address"))
  const taxId = computed(() =>
    COMPANY.taxId ? `${t("company.taxIdLabel")}: ${COMPANY.taxId}` : ""
  )
  /** The legal name with its tax ID, as contracts and legal pages name a party. */
  const entity = computed(() =>
    taxId.value ? `${legalName.value} (${taxId.value})` : legalName.value
  )

  return {
    legalName,
    address,
    taxId,
    entity,
    launched: String(COMPANY.productLaunched),
    incorporated: incorporatedYear(),
  }
}
