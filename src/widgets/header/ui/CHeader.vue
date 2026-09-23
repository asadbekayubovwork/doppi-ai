<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue"
import { useRoute, type RouteLocationRaw } from "vue-router"
import CLanguageSwitcher from "./CLanguageSwitcher.vue"
import CNavMenu from "./CNavMenu.vue"
import { CIcon, CLogo } from "@/shared/ui"
import { SERVICE_NAV } from "@/shared/config/services"
import { RESOURCES_MENU, SERVICES_MENU } from "../model/navMenus"

interface NavItem {
  key: string
  to: RouteLocationRaw
}

const props = withDefaults(defineProps<{ hideBackground?: boolean }>(), {
  hideBackground: false,
})

const route = useRoute()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

// Flat and transparent at the very top; once the page moves, the bar lifts
// into a floating pill. Pages without a header background (404) stay flat.
const isFloating = computed(() => isScrolled.value && !props.hideBackground)

// Every entry is a real page; section anchors live in the footer. Contact sits
// in the Resources menu.
const navigation: NavItem[] = [
  { key: "nav.pricing", to: { path: "/pricing" } },
  { key: "nav.about", to: { path: "/about" } },
]

// The drawer has no dropdowns, so the live Resources pages join the list.
const mobileNavigation: NavItem[] = [
  ...navigation,
  ...RESOURCES_MENU.flatMap((column) => column.items).flatMap((item) =>
    item.to ? [{ key: item.label, to: { path: item.to } }] : []
  ),
]

const isActive = (item: NavItem) =>
  route.path === (item.to as { path: string }).path

const handleScroll = () => {
  isScrolled.value = window.scrollY > 16
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") closeMobileMenu()
}

watch(isMobileMenuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "auto"
})

// A same-page anchor keeps the drawer open otherwise.
watch(() => route.fullPath, closeMobileMenu)

onMounted(() => {
  handleScroll()
  window.addEventListener("scroll", handleScroll, { passive: true })
  window.addEventListener("keydown", handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll)
  window.removeEventListener("keydown", handleKeydown)
  document.body.style.overflow = "auto"
})
</script>

<template>
  <!-- The header itself never takes a filter or transform: either would turn it
       into the containing block of the fixed mobile drawer inside it. -->
  <header class="fixed inset-x-0 top-0 z-50">
    <div class="container relative z-50">
      <!-- The radius and border width never change, so only colour, spacing
           and shadow animate: at the top the pill is simply invisible. -->
      <div
        class="flex items-center justify-between rounded-full border transition-[margin,padding,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        :class="
          isFloating
            ? 'mt-3 border-sand-200/80 bg-white/80 py-3 pl-5 pr-3 shadow-[0_12px_40px_-12px_rgba(12,10,9,0.18)] backdrop-blur-xl sm:mt-4 sm:pl-7'
            : 'mt-0 border-transparent bg-white/0 px-0 py-4 shadow-[0_12px_40px_-12px_rgba(12,10,9,0)] sm:py-5'
        "
      >
        <RouterLink to="/" aria-label="Do'ppi AI">
          <CLogo :with-wordmark="false" surface="light" class="sm:hidden" />
          <CLogo surface="light" class="hidden sm:inline-flex" />
        </RouterLink>

        <nav class="hidden items-center gap-7 lg:flex">
          <CNavMenu
            id="services-menu"
            label="services.navLabel"
            :columns="SERVICES_MENU"
          />
          <!-- Same pill as the CNavMenu triggers, so every nav item answers
               hover alike; the negative margin keeps the gap-7 rhythm. -->
          <RouterLink
            v-for="item in navigation"
            :key="item.key"
            :to="item.to"
            class="-mx-3 rounded-full px-3 py-1.5 text-sm transition-200 hover:bg-sand-100 hover:text-sand-950"
            :class="isActive(item) ? 'text-sand-950' : 'text-sand-500'"
          >
            {{ $t(item.key) }}
          </RouterLink>
          <CNavMenu
            id="resources-menu"
            label="nav.resources"
            :columns="RESOURCES_MENU"
          />
        </nav>

        <div class="hidden items-center gap-4 lg:flex">
          <CLanguageSwitcher />
          <RouterLink
            to="/login"
            class="text-sm font-medium text-sand-600 transition-200 hover:text-sand-950"
          >
            {{ $t("nav.signIn") }}
          </RouterLink>
          <!-- In the pill the button turns into a pill too, concentric with the
               bar: its inset (12px padding + 1px border) plus its 20px radius
               equals the bar's half-height. An explicit 20px rather than
               rounded-full keeps the radius tweening instead of snapping. -->
          <RouterLink
            to="/login"
            class="flex h-10 items-center justify-center bg-sand-950 px-5 text-sm font-medium text-white transition-[background-color,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-sand-800 motion-reduce:transition-none"
            :class="isFloating ? 'rounded-[20px]' : 'rounded-xl'"
          >
            {{ $t("nav.cta") }}
          </RouterLink>
        </div>

        <div class="flex items-center gap-2 lg:hidden">
          <CLanguageSwitcher />
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-sand-950"
            :aria-label="
              isMobileMenuOpen ? $t('a11y.closeMenu') : $t('a11y.openMenu')
            "
            :aria-expanded="isMobileMenuOpen"
            aria-controls="mobile-menu"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <CIcon :name="isMobileMenuOpen ? 'x' : 'menu'" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-40 bg-sand-950/20 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        @click="closeMobileMenu"
      />
    </Transition>

    <Transition name="drawer-left">
      <aside
        v-if="isMobileMenuOpen"
        id="mobile-menu"
        class="fixed inset-y-0 left-0 z-50 flex w-[80%] max-w-xs flex-col border-r border-sand-200 bg-ground/95 backdrop-blur-2xl lg:hidden"
      >
        <div
          class="flex items-center justify-between border-b border-sand-200 px-5 py-4"
        >
          <RouterLink to="/" aria-label="Do'ppi AI" @click="closeMobileMenu">
            <CLogo surface="light" />
          </RouterLink>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-sand-950"
            :aria-label="$t('a11y.closeMenu')"
            @click="closeMobileMenu"
          >
            <CIcon name="x" class="h-5 w-5" />
          </button>
        </div>

        <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4">
          <p
            class="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-sand-500"
          >
            {{ $t("services.navLabel") }}
          </p>
          <RouterLink
            v-for="item in SERVICE_NAV"
            :key="item.key"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-colors"
            :class="
              route.path === item.to
                ? 'bg-sand-100 text-sand-950'
                : 'text-sand-600 hover:bg-sand-100 hover:text-sand-950'
            "
            @click="closeMobileMenu"
          >
            <CIcon :name="item.icon" class="h-5 w-5 text-sand-950" />
            {{ $t(`services.${item.key}.name`) }}
          </RouterLink>
          <span class="my-2 h-px bg-sand-200" aria-hidden="true" />
          <RouterLink
            v-for="item in mobileNavigation"
            :key="item.key"
            :to="item.to"
            class="rounded-lg px-3 py-3 text-base transition-colors"
            :class="
              isActive(item)
                ? 'bg-sand-100 text-sand-950'
                : 'text-sand-600 hover:bg-sand-100 hover:text-sand-950'
            "
            @click="closeMobileMenu"
          >
            {{ $t(item.key) }}
          </RouterLink>
        </nav>

        <div class="border-t border-sand-200 px-5 py-4">
          <RouterLink
            to="/login"
            class="mb-2 flex h-11 items-center justify-center rounded-xl border border-sand-200 bg-white text-sm font-medium text-sand-950 transition-colors hover:bg-sand-100"
            @click="closeMobileMenu"
          >
            {{ $t("nav.signIn") }}
          </RouterLink>
          <RouterLink
            to="/login"
            class="flex h-12 items-center justify-center rounded-xl bg-sand-950 font-medium text-white transition-300 hover:bg-sand-800"
            @click="closeMobileMenu"
          >
            {{ $t("nav.cta") }}
          </RouterLink>
        </div>
      </aside>
    </Transition>
  </header>
</template>
