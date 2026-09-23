<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router"
import { CLogo, CSocialMark } from "@/shared/ui"
import { SOCIALS } from "@/shared/config/socials"
import { SERVICE_NAV } from "@/shared/config/services"

const currentYear = new Date().getFullYear()

interface FooterLink {
  key: string
  to: RouteLocationRaw
}

const productLinks: FooterLink[] = [
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

const socials = SOCIALS
</script>

<template>
  <footer class="section-ground border-t border-sand-200">
    <div class="container relative z-10 py-14">
      <div class="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div class="max-w-xs">
          <RouterLink to="/" aria-label="Do'ppi AI">
            <CLogo surface="light" />
          </RouterLink>
          <p class="mt-4 text-sm leading-relaxed text-sand-500">{{ $t("footer.tagline") }}</p>

          <div v-if="socials.length" class="mt-6 flex items-center gap-3">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="social.label"
              class="grid h-10 w-10 place-items-center rounded-full border border-sand-200 bg-white text-sand-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-sand-400 hover:text-sand-950"
            >
              <CSocialMark :name="social.icon" class="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-sand-950">{{ $t("services.navLabel") }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="item in SERVICE_NAV" :key="item.key">
              <RouterLink
                :to="item.to"
                class="text-sm text-sand-500 transition-colors hover:text-sand-950"
              >
                {{ $t(`services.${item.key}.name`) }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-sand-950">{{ $t("footer.product") }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in productLinks" :key="link.key">
              <RouterLink
                :to="link.to"
                class="text-sm text-sand-500 transition-colors hover:text-sand-950"
              >
                {{ $t(link.key) }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-sand-950">{{ $t("footer.company") }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in companyLinks" :key="link.key">
              <RouterLink
                :to="link.to"
                class="text-sm text-sand-500 transition-colors hover:text-sand-950"
              >
                {{ $t(link.key) }}
              </RouterLink>
            </li>
          </ul>
        </div>

      </div>

      <div
        class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-sand-200 pt-8 sm:flex-row"
      >
        <p class="text-xs text-sand-500">{{ $t("footer.rights", { year: currentYear }) }}</p>
        <div class="flex items-center gap-6">
          <RouterLink to="/privacy" class="text-xs text-sand-500 transition-colors hover:text-sand-950">
            {{ $t("footer.privacy") }}
          </RouterLink>
          <RouterLink to="/terms" class="text-xs text-sand-500 transition-colors hover:text-sand-950">
            {{ $t("footer.terms") }}
          </RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>
