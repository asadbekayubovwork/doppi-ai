<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useHead } from "@unhead/vue"
import { useI18nList } from "@/shared/lib"
import { CIcon } from "@/shared/ui"

interface TermsSection {
  heading: string
  paragraphs: string[]
  bullets: string[]
}

const { t } = useI18n()
const sections = useI18nList<TermsSection>("legal.terms.sections")

const email = computed(() => t("contact.email"))
const phone = computed(() => t("contact.phone"))

useHead({
  title: computed(() => `${t("legal.terms.title")} — Do'ppi AI`),
  meta: [{ name: "robots", content: "noindex, follow" }],
})
</script>

<template>
  <section class="section-ground pt-[130px] pb-[80px] sm:pt-[170px]">
    <div class="ambient-glow left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 opacity-60" aria-hidden="true" />

    <div class="container relative z-10">
      <div class="mx-auto max-w-[760px]">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-sand-500 transition-colors hover:text-sand-950"
        >
          <CIcon name="arrow-right" class="h-4 w-4 rotate-180" />
          {{ $t("legal.back") }}
        </RouterLink>

        <header class="mt-4">
          <span
            class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sand-500"
          >
            <span class="h-px w-6 bg-signal" aria-hidden="true" />
            {{ $t("legal.eyebrow") }}
          </span>
          <h1 class="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-sand-950">
            {{ $t("legal.terms.title") }}
          </h1>
          <p class="mt-4 text-sm text-sand-500">{{ $t("legal.terms.updated") }}</p>
          <p class="mt-6 text-base leading-relaxed text-sand-600">
            {{ $t("legal.terms.intro") }}
          </p>
        </header>

        <div class="mt-8 rounded-2xl border border-sand-200 bg-sand-100 p-5">
          <p class="text-sm leading-relaxed text-sand-700">
            {{ $t("legal.terms.disclaimerNote") }}
          </p>
        </div>

        <div class="mt-12 space-y-12">
          <section v-for="(section, i) in sections" :key="section.heading">
            <h2 class="flex items-baseline gap-3 text-xl sm:text-2xl font-bold tracking-tight text-sand-950">
              <span aria-hidden="true" class="text-sm font-semibold text-sand-400">
                {{ String(i + 1).padStart(2, "0") }}
              </span>
              <span>{{ section.heading }}</span>
            </h2>

            <div class="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-sand-600">
              <p v-for="(paragraph, pi) in section.paragraphs" :key="pi">{{ paragraph }}</p>

              <ul v-if="section.bullets.length" class="space-y-2.5">
                <li v-for="(bullet, bi) in section.bullets" :key="bi" class="flex gap-3">
                  <span aria-hidden="true" class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sand-950" />
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <section class="mt-12">
          <h2 class="text-xl font-semibold text-sand-950">{{ $t("legal.terms.contactHeading") }}</h2>
          <p class="mt-3 leading-relaxed text-sand-600">{{ $t("legal.terms.contactLead") }}</p>

          <ul class="mt-4 space-y-2 text-sand-600">
            <li>
              <a
                :href="`mailto:${email}`"
                class="inline-flex items-center gap-2.5 transition-colors hover:text-sand-950"
              >
                <CIcon name="mail" class="h-4 w-4 text-sand-950" />
                {{ email }}
              </a>
            </li>
            <li>
              <a
                :href="`tel:${phone.replace(/\s/g, '')}`"
                class="inline-flex items-center gap-2.5 transition-colors hover:text-sand-950"
              >
                <CIcon name="phone" class="h-4 w-4 text-sand-950" />
                {{ phone }}
              </a>
            </li>
          </ul>
        </section>

        <div class="surface-card mt-12 rounded-2xl p-6 text-center">
          <h2 class="text-lg font-semibold text-sand-950">{{ $t("legal.terms.ctaTitle") }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-sand-600">{{ $t("legal.terms.ctaBody") }}</p>
          <RouterLink
            to="/"
            class="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-sand-950 px-6 text-sm font-medium text-white transition-300 hover:bg-sand-800"
          >
            {{ $t("legal.terms.ctaButton") }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
