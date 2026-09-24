import { onMounted, ref } from "vue"
import {
  billingApi,
  type CreditPack,
  type CreditRate,
  type IntroOffer,
  type SubscriptionPlan,
} from "../api/billingApi"

export function usePublicPricing() {
  const plans = ref<SubscriptionPlan[]>([])
  const packs = ref<CreditPack[]>([])
  const rates = ref<CreditRate[]>([])
  const intro = ref<IntroOffer | null>(null)
  const loading = ref(true)
  const error = ref(false)

  const refresh = async () => {
    loading.value = true
    error.value = false
    try {
      const [nextPlans, nextPacks, nextRates, nextIntro] = await Promise.all([
        billingApi.plans(),
        billingApi.packs(),
        billingApi.rates(),
        billingApi.intro(),
      ])
      plans.value = nextPlans
      packs.value = nextPacks
      rates.value = nextRates
      intro.value = nextIntro
    } catch {
      plans.value = []
      packs.value = []
      rates.value = []
      intro.value = null
      error.value = true
    } finally {
      loading.value = false
    }
  }
  onMounted(() => void refresh())
  return { plans, packs, rates, intro, loading, error, refresh }
}
