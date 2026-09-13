<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useHead } from "@unhead/vue"
import { useI18nList } from "@/shared/lib"
import { CIcon } from "@/shared/ui"

interface Section {
  h: string
  p: string
}

const { t } = useI18n()
const sections = useI18nList<Section>("legal.privacy.sections")

const email = computed(() => t("contact.email"))
const phone = computed(() => t("contact.phone"))

useHead({
  title: computed(() => `${t("legal.privacy.title")} — Do'ppi.ai`),
  meta: [{ name: "robots", content: "noindex, follow" }],
})
</script>

<template>
  <section class="section-dark pt-[130px] pb-[80px] sm:pt-[170px]">
    <div class="violet-glow left-1/2 -top-24 h-72 w-72 -translate-x-1/2 opacity-60" aria-hidden="true" />

    <div class="container relative z-10">
      <div class="mx-auto max-w-[760px]">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-[#A3A3A3] transition-colors hover:text-[#B9A2FF]"
        >
          <CIcon name="arrow-right" class="h-4 w-4 rotate-180" />
          {{ $t("legal.back") }}
        </RouterLink>

        <h1 class="mt-4 text-4xl font-bold tracking-tight text-white">
          {{ $t("legal.privacy.title") }}
        </h1>
        <p class="mt-3 text-sm text-[#A3A3A3]">{{ $t("legal.privacy.updated") }}</p>

        <section v-for="section in sections" :key="section.h">
          <h2 class="mt-10 text-xl font-semibold text-white">{{ section.h }}</h2>
          <p class="mt-3 leading-relaxed text-[#A3A3A3]">{{ section.p }}</p>
        </section>

        <section>
          <h2 class="mt-10 text-xl font-semibold text-white">
            {{ $t("legal.privacy.contact.h") }}
          </h2>
          <p class="mt-3 leading-relaxed text-[#A3A3A3]">{{ $t("legal.privacy.contact.p") }}</p>

          <ul class="mt-4 space-y-2 text-[#A3A3A3]">
            <li>
              <a
                :href="`mailto:${email}`"
                class="inline-flex items-center gap-2.5 transition-colors hover:text-[#B9A2FF]"
              >
                <CIcon name="mail" class="h-4 w-4 text-[#8F6BFF]" />
                {{ email }}
              </a>
            </li>
            <li>
              <a
                :href="`tel:${phone.replace(/\s/g, '')}`"
                class="inline-flex items-center gap-2.5 transition-colors hover:text-[#B9A2FF]"
              >
                <CIcon name="phone" class="h-4 w-4 text-[#8F6BFF]" />
                {{ phone }}
              </a>
            </li>
            <li class="inline-flex items-center gap-2.5">
              <CIcon name="map-pin" class="h-4 w-4 text-[#8F6BFF]" />
              {{ $t("contact.location") }}
            </li>
          </ul>
        </section>

        <div class="mt-12 rounded-2xl border border-[#6633EE]/40 bg-[#6633EE]/10 p-5">
          <h2 class="flex items-center gap-2 text-base font-semibold text-[#C9B8FF]">
            <CIcon name="shield-check" class="h-5 w-5 shrink-0" />
            {{ $t("legal.privacy.disclaimer.h") }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-[#A3A3A3]">
            {{ $t("legal.privacy.disclaimer.p") }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
