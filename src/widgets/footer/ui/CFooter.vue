<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import type { RouteLocationRaw } from "vue-router"
import { CIcon, CLogo } from "@/shared/ui"
import { SOCIALS } from "@/shared/config/socials"
import { SERVICE_NAV } from "@/shared/config/services"

const { t } = useI18n()
const currentYear = new Date().getFullYear()

interface FooterLink {
  key: string
  to: RouteLocationRaw
}

const productLinks: FooterLink[] = [
  { key: "nav.product", to: { path: "/product" } },
  { key: "nav.features", to: { path: "/product", hash: "#features" } },
  { key: "nav.how", to: { path: "/product", hash: "#how" } },
  { key: "nav.voice", to: { path: "/product", hash: "#voice" } },
  { key: "nav.pricing", to: { path: "/pricing" } },
]

const companyLinks: FooterLink[] = [
  { key: "nav.about", to: { path: "/about" } },
  { key: "nav.team", to: { path: "/about", hash: "#team" } },
  { key: "nav.results", to: { path: "/", hash: "#results" } },
  { key: "nav.contact", to: { path: "/contact-us" } },
]

const email = computed(() => t("contact.email"))
const phone = computed(() => t("contact.phone"))

const contactRows = computed(() => [
  { icon: "mail", label: email.value, href: `mailto:${email.value}` },
  { icon: "phone", label: phone.value, href: `tel:${phone.value.replace(/\s+/g, "")}` },
  { icon: "globe", label: t("contact.website"), href: `https://${t("contact.website")}` },
  { icon: "map-pin", label: t("contact.location") },
])

const socials = SOCIALS
</script>

<template>
  <footer class="section-dark border-t border-white/10">
    <div class="container relative z-10 py-14">
      <div class="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div class="max-w-xs">
          <RouterLink to="/" aria-label="Do'ppi.ai">
            <CLogo />
          </RouterLink>
          <p class="mt-4 text-sm leading-relaxed text-[#A3A3A3]">{{ $t("footer.tagline") }}</p>

          <div v-if="socials.length" class="mt-6 flex items-center gap-3">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="social.label"
              class="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-[#A3A3A3] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6633EE]/50 hover:text-[#B9A2FF]"
            >
              <CIcon :name="social.icon" class="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-white">{{ $t("services.navLabel") }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="item in SERVICE_NAV" :key="item.key">
              <RouterLink
                :to="item.to"
                class="text-sm text-[#A3A3A3] transition-colors hover:text-[#B9A2FF]"
              >
                {{ $t(`services.${item.key}.name`) }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-white">{{ $t("footer.product") }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in productLinks" :key="link.key">
              <RouterLink
                :to="link.to"
                class="text-sm text-[#A3A3A3] transition-colors hover:text-[#B9A2FF]"
              >
                {{ $t(link.key) }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-white">{{ $t("footer.company") }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in companyLinks" :key="link.key">
              <RouterLink
                :to="link.to"
                class="text-sm text-[#A3A3A3] transition-colors hover:text-[#B9A2FF]"
              >
                {{ $t(link.key) }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-white">{{ $t("footer.contactTitle") }}</h3>
          <ul class="mt-4 space-y-3 text-sm text-[#A3A3A3]">
            <li v-for="row in contactRows" :key="row.label">
              <component
                :is="row.href ? 'a' : 'span'"
                :href="row.href"
                class="inline-flex items-center gap-2.5 transition-colors"
                :class="row.href ? 'hover:text-[#B9A2FF]' : ''"
              >
                <CIcon :name="row.icon" class="h-4 w-4 text-[#8F6BFF]" />
                {{ row.label }}
              </component>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row"
      >
        <p class="text-xs text-[#8F8E8A]">{{ $t("footer.rights", { year: currentYear }) }}</p>
        <div class="flex items-center gap-6">
          <RouterLink to="/privacy" class="text-xs text-[#8F8E8A] transition-colors hover:text-white">
            {{ $t("footer.privacy") }}
          </RouterLink>
          <RouterLink to="/terms" class="text-xs text-[#8F8E8A] transition-colors hover:text-white">
            {{ $t("footer.terms") }}
          </RouterLink>
          <span class="text-xs text-[#8F8E8A]">{{ $t("footer.madeIn") }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
