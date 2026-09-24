<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import { messageForProblem } from "@/features/auth"
import { platformAdminApi, type AdminCatalog } from "../api/platformAdminApi"

const catalog = ref<AdminCatalog | null>(null)
const settings = reactive<Record<string, string>>({})
const rates = reactive<Record<string, number>>({})
const rateUnits = reactive<Record<string, number>>({})
const draft = reactive({ code: "", title: "", credits: 0, price_cents: 0 })
const reason = ref("")
const error = ref("")
const success = ref("")
const loading = ref(true)
const saving = ref(false)
const load = async () => {
  loading.value = true
  error.value = ""
  try {
    catalog.value = await platformAdminApi.catalog()
    Object.assign(settings, catalog.value.settings)
    Object.assign(
      rates,
      Object.fromEntries(
        catalog.value.rates.map((rate) => [rate.code, rate.credits_per_unit])
      )
    )
    Object.assign(
      rateUnits,
      Object.fromEntries(
        catalog.value.rates.map((rate) => [rate.code, rate.units_per_charge])
      )
    )
  } catch (cause) {
    error.value = messageForProblem(cause, "Narxlar yuklanmadi.")
  } finally {
    loading.value = false
  }
}
const save = async (action: () => Promise<unknown>) => {
  if (reason.value.trim().length < 8) {
    error.value = "O‘zgarish sababini kamida 8 belgi bilan yozing."
    return
  }
  saving.value = true
  error.value = ""
  success.value = ""
  try {
    await action()
    await load()
    success.value = "O‘zgarish saqlandi."
  } catch (cause) {
    error.value = messageForProblem(
      cause,
      "Saqlanmadi. Qayta kiring va urinib ko‘ring."
    )
  } finally {
    saving.value = false
  }
}
const createPack = () => {
  if (
    !draft.code ||
    !draft.title ||
    draft.credits <= 0 ||
    draft.price_cents <= 0
  ) {
    error.value = "Paket maydonlarini to‘ldiring."
    return
  }
  void save(async () => {
    await platformAdminApi.createPack({
      ...draft,
      active: false,
      sort_order: 100,
      reason: reason.value,
    })
    Object.assign(draft, { code: "", title: "", credits: 0, price_cents: 0 })
  })
}
onMounted(() => void load())
</script>

<template>
  <section class="space-y-5">
    <p
      v-if="error"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </p>
    <p
      v-if="success"
      role="status"
      class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
    >
      {{ success }}
    </p>
    <p v-if="loading && !catalog" class="text-sm text-[#92929F]">
      Yuklanmoqda…
    </p>
    <template v-if="catalog">
      <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
        <label for="admin-reason" class="text-sm font-semibold"
          >O‘zgarish sababi</label
        >
        <input
          id="admin-reason"
          v-model="reason"
          class="mt-2 w-full rounded-xl border border-[#DEDEE5] px-4 py-2.5 text-sm outline-none focus:border-[#808080]"
          placeholder="Kamida 8 belgi; audit jurnalida saqlanadi"
        />
      </div>
      <div class="grid gap-5 lg:grid-cols-2">
        <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
          <h2 class="text-lg font-bold">Bonus siyosati</h2>
          <div
            v-for="(value, key) in catalog.settings"
            :key="key"
            class="mt-3 rounded-xl bg-[#F7F7F9] p-4"
          >
            <label
              :for="`setting-${key}`"
              class="block text-xs font-semibold text-[#747480]"
              >{{ key }}</label
            >
            <div class="mt-2 flex gap-2">
              <input
                :id="`setting-${key}`"
                v-model="settings[key]"
                class="min-w-0 flex-1 rounded-lg border border-[#D8D8DE] bg-white px-3 py-2 text-sm"
              /><button
                :disabled="saving || settings[key] === value"
                class="rounded-lg bg-[#202026] px-3 text-sm font-semibold text-white disabled:opacity-40"
                @click="
                  save(() =>
                    platformAdminApi.setting(String(key), settings[key], reason)
                  )
                "
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
          <h2 class="text-lg font-bold">Sarf stavkalari</h2>
          <div
            v-for="rate in catalog.rates"
            :key="rate.code"
            class="mt-3 rounded-xl bg-[#F7F7F9] p-4"
          >
            <label
              :for="`rate-${rate.code}`"
              class="block text-xs font-semibold text-[#747480]"
              >{{ rate.code }} · kredit / birliklar</label
            >
            <div class="mt-2 flex gap-2">
              <input
                :id="`rate-${rate.code}`"
                v-model.number="rates[rate.code]"
                type="number"
                min="0"
                step="1"
                class="min-w-0 flex-1 rounded-lg border border-[#D8D8DE] bg-white px-3 py-2 text-sm"
              /><input
                v-model.number="rateUnits[rate.code]"
                :aria-label="`${rate.code} birliklar soni`"
                type="number"
                min="1"
                step="1"
                class="w-24 rounded-lg border border-[#D8D8DE] bg-white px-3 py-2 text-sm"
              /><button
                :disabled="
                  saving ||
                  (rates[rate.code] === rate.credits_per_unit &&
                    rateUnits[rate.code] === rate.units_per_charge)
                "
                class="rounded-lg bg-[#202026] px-3 text-sm font-semibold text-white disabled:opacity-40"
                @click="
                  save(() =>
                    platformAdminApi.rate(
                      rate.code,
                      rates[rate.code],
                      rateUnits[rate.code],
                      reason
                    )
                  )
                "
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
        <h2 class="text-lg font-bold">Tarif rejalar</h2>
        <p class="mt-1 text-xs text-[#8D8D99]">
          To‘lov tizimi ulanmaguncha avtomatik xarid yo‘q.
        </p>
        <form
          v-for="plan in catalog.plans"
          :key="plan.code"
          class="mt-3 grid gap-2 rounded-xl bg-[#F7F7F9] p-4 sm:grid-cols-[1fr_120px_130px_100px_auto]"
          @submit.prevent="
            save(() =>
              platformAdminApi.plan(plan.code, {
                monthly_price_cents: plan.monthly_price_cents,
                credits_per_month: plan.credits_per_month,
                yearly_discount_bps: plan.yearly_discount_bps,
                active: plan.active,
                reason,
              })
            )
          "
        >
          <strong class="self-center text-sm capitalize">{{
            plan.code
          }}</strong>
          <label class="text-xs"
            >Narx (sent)
            <input
              v-model.number="plan.monthly_price_cents"
              type="number"
              min="1"
              class="mt-1 w-full rounded-lg border border-[#D8D8DE] bg-white px-2 py-2 text-sm"
            />
          </label>
          <label class="text-xs"
            >Kredit / oy
            <input
              v-model.number="plan.credits_per_month"
              type="number"
              min="1"
              class="mt-1 w-full rounded-lg border border-[#D8D8DE] bg-white px-2 py-2 text-sm"
            />
          </label>
          <label class="text-xs"
            >Yillik chegirma %
            <input
              :value="plan.yearly_discount_bps / 100"
              type="number"
              min="0"
              max="90"
              step="1"
              class="mt-1 w-full rounded-lg border border-[#D8D8DE] bg-white px-2 py-2 text-sm"
              @input="
                plan.yearly_discount_bps =
                  Number(($event.target as HTMLInputElement).value) * 100
              "
            />
          </label>
          <div class="flex items-center gap-2">
            <label class="text-xs"
              ><input v-model="plan.active" type="checkbox" /> Aktiv</label
            >
            <button
              :disabled="saving"
              class="rounded-lg bg-[#202026] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
      <div class="rounded-2xl border border-[#E8E8EC] bg-white p-6">
        <h2 class="text-lg font-bold">Kredit paketlari</h2>
        <p class="mt-1 text-xs text-[#8D8D99]">
          To‘lov integratsiyasi yoqilmaguncha xarid avtomatik amalga
          oshirilmaydi.
        </p>
        <p v-if="!catalog.packs.length" class="mt-4 text-sm text-[#91919B]">
          Hozircha paket yo‘q.
        </p>
        <div
          v-for="pack in catalog.packs"
          :key="pack.id"
          class="mt-3 rounded-xl bg-[#F7F7F9] p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong class="text-sm">{{ pack.title }}</strong>
              <p class="mt-1 text-xs text-[#858591]">
                {{ pack.code }} ·
                {{ pack.credits.toLocaleString("uz-UZ") }} kredit · ${{
                  (pack.price_cents / 100).toFixed(2)
                }}
                · {{ pack.active ? "Aktiv" : "Draft" }}
              </p>
            </div>
            <button
              :disabled="saving"
              class="rounded-lg border border-[#D8D8DE] bg-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
              @click="
                save(() =>
                  platformAdminApi.updatePack(pack.id, {
                    active: !pack.active,
                    reason,
                  })
                )
              "
            >
              {{ pack.active ? "Yashirish" : "E’lon qilish" }}
            </button>
          </div>
          <form
            class="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_120px_auto]"
            @submit.prevent="
              save(() =>
                platformAdminApi.updatePack(pack.id, {
                  title: pack.title,
                  credits: pack.credits,
                  price_cents: pack.price_cents,
                  reason,
                })
              )
            "
          >
            <input
              v-model="pack.title"
              aria-label="Paket nomi"
              class="min-w-0 rounded-lg border border-[#D8D8DE] bg-white px-3 py-2 text-sm"
            /><input
              v-model.number="pack.credits"
              aria-label="Kredit miqdori"
              type="number"
              min="1"
              class="min-w-0 rounded-lg border border-[#D8D8DE] bg-white px-3 py-2 text-sm"
            /><input
              v-model.number="pack.price_cents"
              aria-label="Narx sentda"
              type="number"
              min="1"
              class="min-w-0 rounded-lg border border-[#D8D8DE] bg-white px-3 py-2 text-sm"
            /><button
              :disabled="saving"
              class="rounded-lg bg-[#202026] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Saqlash
            </button>
          </form>
        </div>
        <form
          class="mt-5 grid gap-2 border-t border-[#EBEBEF] pt-5 sm:grid-cols-[1fr_1fr_120px_120px_auto]"
          @submit.prevent="createPack"
        >
          <input
            v-model.trim="draft.code"
            aria-label="Yangi paket kodi"
            placeholder="Kod"
            pattern="[a-z0-9_-]{3,80}"
            class="min-w-0 rounded-lg border border-[#D8D8DE] px-3 py-2 text-sm"
          /><input
            v-model.trim="draft.title"
            aria-label="Yangi paket nomi"
            placeholder="Nomi"
            class="min-w-0 rounded-lg border border-[#D8D8DE] px-3 py-2 text-sm"
          /><input
            v-model.number="draft.credits"
            aria-label="Yangi paket krediti"
            type="number"
            min="1"
            placeholder="Kredit"
            class="min-w-0 rounded-lg border border-[#D8D8DE] px-3 py-2 text-sm"
          /><input
            v-model.number="draft.price_cents"
            aria-label="Yangi paket narxi sentda"
            type="number"
            min="1"
            placeholder="Sent"
            class="min-w-0 rounded-lg border border-[#D8D8DE] px-3 py-2 text-sm"
          /><button
            :disabled="saving"
            class="rounded-lg bg-[#202026] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Qo‘shish
          </button>
        </form>
      </div>
    </template>
  </section>
</template>
