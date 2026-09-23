<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { CIcon, CSectionHeading } from "@/shared/ui"

const { t } = useI18n()

const form = ref({
  name: "",
  phone: "",
  email: "",
  business: "",
  message: "",
})

const sent = ref(false)
const sending = ref(false)

const fields = computed(() => [
  {
    id: "contact-name",
    key: "name" as const,
    label: t("contact.form.name"),
    placeholder: t("contact.form.placeholders.name"),
    type: "text",
    required: true,
    autocomplete: "name",
  },
  {
    id: "contact-phone",
    key: "phone" as const,
    label: t("contact.form.phone"),
    placeholder: t("contact.form.placeholders.phone"),
    type: "tel",
    required: true,
    autocomplete: "tel",
  },
  {
    id: "contact-email",
    key: "email" as const,
    label: t("contact.form.email"),
    placeholder: t("contact.form.placeholders.email"),
    type: "email",
    required: false,
    autocomplete: "email",
  },
  {
    id: "contact-business",
    key: "business" as const,
    label: t("contact.form.business"),
    placeholder: t("contact.form.placeholders.business"),
    type: "text",
    required: false,
    autocomplete: "organization",
  },
])

const email = computed(() => t("contact.email"))
const phone = computed(() => t("contact.phone"))
const website = computed(() => t("contact.website"))

const reachRows = computed(() => [
  { icon: "mail", label: email.value, href: `mailto:${email.value}` },
  {
    icon: "phone",
    label: phone.value,
    href: `tel:${phone.value.replace(/\s+/g, "")}`,
  },
  {
    icon: "globe",
    label: website.value,
    href: `https://${website.value}`,
    external: true,
  },
  { icon: "map-pin", label: t("contact.location") },
])

/**
 * Posts the lead to the CRM endpoint. If that request fails (or no backend is
 * wired up yet) it falls back to a pre-filled mail draft, so a submission is
 * never silently dropped.
 */
const handleSubmit = async () => {
  if (sending.value) return
  sending.value = true

  const payload = { ...form.value }

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error("request failed")
  } catch {
    const subject = `Do'ppi AI demo — ${payload.business || payload.name}`
    const body = [
      `${t("contact.form.name")}: ${payload.name}`,
      `${t("contact.form.phone")}: ${payload.phone}`,
      `${t("contact.form.email")}: ${payload.email}`,
      `${t("contact.form.business")}: ${payload.business}`,
      "",
      payload.message,
    ].join("\n")
    window.location.href = `mailto:${email.value}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`
  } finally {
    sending.value = false
    sent.value = true
  }
}
</script>

<template>
  <section id="contact" class="section-ground py-[60px] sm:py-[100px]">
    <div
      class="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <div class="grid items-start gap-12 lg:grid-cols-2">
        <!-- Heading + direct contact details -->
        <div>
          <CSectionHeading align="left" :title="$t('contact.title')" />

          <h3 class="mt-10 text-lg font-semibold text-sand-950">
            {{ $t("contact.reachTitle") }}
          </h3>

          <ul class="mt-6 space-y-4">
            <li v-for="row in reachRows" :key="row.label">
              <component
                :is="row.href ? 'a' : 'div'"
                :href="row.href"
                :target="row.external ? '_blank' : undefined"
                :rel="row.external ? 'noreferrer' : undefined"
                class="group -mx-2 flex items-center gap-4 rounded-xl px-2 py-1.5 transition-colors"
              >
                <span
                  class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sand-100 text-sand-950"
                >
                  <CIcon :name="row.icon" class="h-5 w-5" />
                </span>
                <span
                  class="text-sm transition-colors"
                  :class="
                    row.href
                      ? 'text-sand-950 group-hover:text-sand-600'
                      : 'text-sand-500'
                  "
                >
                  {{ row.label }}
                </span>
              </component>
            </li>
          </ul>
        </div>

        <!-- Lead form. AOS owns the wrapper; the panel sits inside so its hover
             transition survives (AOS overrides transition-property otherwise). -->
        <div data-aos="fade-up" data-aos-duration="900" data-aos-delay="150">
          <div class="surface-card rounded-2xl p-6 sm:p-8">
            <div
              v-if="sent"
              class="flex flex-col items-center py-10 text-center"
            >
              <span
                class="grid h-14 w-14 place-items-center rounded-full bg-sand-950 text-white"
              >
                <CIcon name="check" class="h-7 w-7" stroke-width="2.5" />
              </span>
              <h3 class="mt-6 text-xl font-semibold text-sand-950">
                {{ $t("contact.success.title") }}
              </h3>
              <p class="mt-2 max-w-sm leading-relaxed text-sand-500">
                {{ $t("contact.success.subtitle") }}
              </p>
            </div>

            <form
              v-else
              class="grid gap-x-4 gap-y-5 sm:grid-cols-2"
              @submit.prevent="handleSubmit"
            >
              <div
                v-for="field in fields"
                :key="field.id"
                class="flex flex-col gap-2"
              >
                <label :for="field.id" class="text-sm font-medium text-sand-950">
                  {{ field.label }}
                  <span
                    v-if="field.required"
                    class="text-signal"
                    aria-hidden="true"
                  >
                    *</span
                  >
                </label>
                <input
                  :id="field.id"
                  v-model="form[field.key]"
                  :type="field.type"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  :autocomplete="field.autocomplete"
                  class="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-sand-950 outline-none transition-colors placeholder:text-sand-400 focus:border-sand-950"
                />
              </div>

              <div class="flex flex-col gap-2 sm:col-span-2">
                <label
                  for="contact-message"
                  class="text-sm font-medium text-sand-950"
                >
                  {{ $t("contact.form.message") }}
                </label>
                <textarea
                  id="contact-message"
                  v-model="form.message"
                  :placeholder="$t('contact.form.placeholders.message')"
                  rows="4"
                  class="w-full resize-y rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-sand-950 outline-none transition-colors placeholder:text-sand-400 focus:border-sand-950"
                />
              </div>

              <div class="sm:col-span-2">
                <button
                  type="submit"
                  :disabled="sending"
                  class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sand-950 font-medium text-white transition-300 hover:bg-sand-800 disabled:opacity-60"
                >
                  {{
                    sending
                      ? $t("contact.form.sending")
                      : $t("contact.form.submit")
                  }}
                  <CIcon v-if="!sending" name="send" class="h-4 w-4" />
                </button>
                <p class="mt-3 text-xs leading-relaxed text-sand-500">
                  {{ $t("contact.form.privacy") }}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
