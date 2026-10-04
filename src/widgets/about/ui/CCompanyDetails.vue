<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { COMPANY } from "@/shared/config/company"
import { useCompany } from "@/shared/lib"
import { CSectionHeading } from "@/shared/ui"

/**
 * Who stands behind the product, word for word as registered — what a
 * reviewer verifying the business (Google for Startups, billing) checks the
 * application against. Rows with no value yet (the STIR) are left out.
 */
const { t } = useI18n()
const { legalName, address, launched, incorporated } = useCompany()

const rows = computed(() =>
  [
    { label: t("about.facts.entity"), value: legalName.value },
    { label: t("about.details.brand"), value: t("brand.name") },
    { label: t("about.facts.launched"), value: launched },
    { label: t("about.facts.incorporated"), value: incorporated },
    { label: t("company.taxIdLabel"), value: COMPANY.taxId },
    { label: t("about.details.address"), value: address.value },
    { label: t("about.facts.focus"), value: t("about.facts.focusValue") },
  ].filter((row) => row.value)
)
</script>

<template>
  <section id="company" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <CSectionHeading align="left" :title="$t('about.details.title')" />

          <p
            class="mt-6 text-base leading-relaxed text-sand-800 sm:text-lg"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {{ $t("about.details.lead", { company: legalName, launched, incorporated }) }}
          </p>
          <p
            class="mt-4 text-base leading-relaxed text-sand-500"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="100"
          >
            {{ $t("about.details.funding") }}
          </p>
        </div>

        <!-- AOS owns the wrapper; the card sits inside so its transition survives. -->
        <div data-aos="fade-up" data-aos-duration="900" data-aos-delay="150">
          <dl class="surface-card divide-y divide-sand-200 rounded-2xl px-6 sm:px-8">
            <div
              v-for="row in rows"
              :key="row.label"
              class="grid gap-1 py-4 sm:grid-cols-[minmax(0,180px)_1fr] sm:gap-6"
            >
              <dt class="text-sm text-sand-500">{{ row.label }}</dt>
              <dd class="text-sm font-medium leading-relaxed text-sand-950">{{ row.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>
