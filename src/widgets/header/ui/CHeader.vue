<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue"
import { useRoute, type RouteLocationRaw } from "vue-router"
import CLanguageSwitcher from "./CLanguageSwitcher.vue"
import CServicesMenu from "./CServicesMenu.vue"
import { CIcon, CLogo } from "@/shared/ui"
import { SERVICE_NAV } from "@/shared/config/services"

interface NavItem {
  key: string
  to: RouteLocationRaw
}

withDefaults(defineProps<{ hideBackground?: boolean }>(), {
  hideBackground: false,
})

const route = useRoute()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

// Every entry is a real page; section anchors live in the footer.
const navigation: NavItem[] = [
  { key: "nav.product", to: { path: "/product" } },
  { key: "nav.pricing", to: { path: "/pricing" } },
  { key: "nav.about", to: { path: "/about" } },
  { key: "nav.team", to: { path: "/about", hash: "#team" } },
  { key: "nav.contact", to: { path: "/contact-us" } },
]

const isActive = (item: NavItem) => {
  const target = item.to as { path: string; hash?: string }
  if (target.hash)
    return route.path === target.path && route.hash === target.hash
  return route.path === target.path
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 8
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
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="[
      isScrolled && !hideBackground
        ? 'border-b border-sand-200 bg-ground/80 backdrop-blur-2xl'
        : 'border-b border-transparent',
    ]"
  >
    <div class="container relative z-50">
      <div
        class="flex items-center justify-between transition-all duration-300"
        :class="isScrolled ? 'py-3' : 'py-4 sm:py-5'"
      >
        <RouterLink to="/" aria-label="Do'ppi AI">
          <CLogo :with-wordmark="false" surface="light" class="sm:hidden" />
          <CLogo surface="light" class="hidden sm:inline-flex" />
        </RouterLink>

        <nav class="hidden items-center gap-7 lg:flex">
          <CServicesMenu />
          <RouterLink
            v-for="item in navigation"
            :key="item.key"
            :to="item.to"
            class="text-sm transition-200"
            :class="
              isActive(item)
                ? 'text-sand-950'
                : 'text-sand-500 hover:text-sand-950'
            "
          >
            {{ $t(item.key) }}
          </RouterLink>
        </nav>

        <div class="hidden items-center gap-4 lg:flex">
          <CLanguageSwitcher />
          <RouterLink
            to="/login"
            class="text-sm font-medium text-sand-600 transition-200 hover:text-sand-950"
          >
            {{ $t("nav.signIn") }}
          </RouterLink>
          <RouterLink
            to="/login"
            class="flex h-10 items-center justify-center rounded-xl bg-sand-950 px-5 text-sm font-medium text-white transition-300 hover:bg-sand-800"
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
            v-for="item in navigation"
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
