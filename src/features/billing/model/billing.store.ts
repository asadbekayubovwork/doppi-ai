import { defineStore } from "pinia"
import { billingApi, type Wallet } from "../api/billingApi"

export const useBillingStore = defineStore("billing", {
  state: () => ({
    wallet: null as Wallet | null,
    businessId: "",
    loading: false,
    error: false,
  }),
  actions: {
    async load(businessId: string) {
      if (!businessId) {
        this.$reset()
        return
      }
      this.businessId = businessId
      this.loading = true
      try {
        const wallet = await billingApi.wallet(businessId)
        if (this.businessId !== businessId) return
        this.wallet = wallet
        this.error = false
      } catch {
        if (this.businessId !== businessId) return
        this.wallet = null
        this.error = true
      } finally {
        if (this.businessId === businessId) this.loading = false
      }
    },
    clear() {
      this.$reset()
    },
  },
})
