<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue"
import { useRoute, type RouteLocationRaw } from "vue-router"
import CLanguageSwitcher from "./CLanguageSwitcher.vue"
import CBgColorPicker from "./CBgColorPicker.vue"
import CServicesMenu from "./CServicesMenu.vue"
import { CIcon, CLogo } from "@/shared/ui"
import { isGroundPickerEnabled } from "@/shared/lib"
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

// Background preview tool — dev only, or `?bg` on a deployed build.
const showBgPicker = isGroundPickerEnabled()

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
        ? 'border-b border-white/10 bg-ground/80 backdrop-blur-2xl'
        : 'border-b border-transparent',
    ]"
  >
    <div class="container relative z-50">
      <div
        class="flex items-center justify-between transition-all duration-300"
        :class="isScrolled ? 'py-3' : 'py-4 sm:py-5'"
      >
        <RouterLink to="/" aria-label="Do'ppi.ai">
          <CLogo :with-wordmark="false" class="sm:hidden" />
          <CLogo class="hidden sm:inline-flex" />
        </RouterLink>

        <nav class="hidden items-center gap-7 lg:flex">
          <CServicesMenu />
          <RouterLink
            v-for="item in navigation"
            :key="item.key"
            :to="item.to"
            class="text-sm text-white/75 transition-200 hover:text-white"
            :class="{ 'text-[#8F6BFF]': isActive(item) }"
          >
            {{ $t(item.key) }}
          </RouterLink>
        </nav>

        <div class="hidden items-center gap-4 lg:flex">
          <CBgColorPicker v-if="showBgPicker" />
          <CLanguageSwitcher />
          <RouterLink
            to="/login"
            class="text-sm font-medium text-white/75 transition-200 hover:text-white"
          >
            {{ $t("nav.signIn") }}
          </RouterLink>
          <RouterLink
            to="/login"
            class="flex h-10 items-center justify-center rounded-xl bg-[#6633EE] px-5 text-sm font-medium text-white transition-300 hover:bg-[#6633EE]/80"
          >
            {{ $t("nav.cta") }}
          </RouterLink>
        </div>

        <div class="flex items-center gap-2 lg:hidden">
          <CBgColorPicker v-if="showBgPicker" />
          <CLanguageSwitcher />
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
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
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        @click="closeMobileMenu"
      />
    </Transition>

    <Transition name="drawer-left">
      <aside
        v-if="isMobileMenuOpen"
        id="mobile-menu"
        class="fixed inset-y-0 left-0 z-50 flex w-[80%] max-w-xs flex-col border-r border-white/10 bg-ground/95 backdrop-blur-2xl lg:hidden"
      >
        <div
          class="flex items-center justify-between border-b border-white/10 px-5 py-4"
        >
          <RouterLink to="/" aria-label="Do'ppi.ai" @click="closeMobileMenu">
            <CLogo />
          </RouterLink>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
            :aria-label="$t('a11y.closeMenu')"
            @click="closeMobileMenu"
          >
            <CIcon name="x" class="h-5 w-5" />
          </button>
        </div>

        <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4">
          <p
            class="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8F6BFF]"
          >
            {{ $t("services.navLabel") }}
          </p>
          <RouterLink
            v-for="item in SERVICE_NAV"
            :key="item.key"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-3 text-base text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            :class="{ 'text-[#8F6BFF]': route.path === item.to }"
            @click="closeMobileMenu"
          >
            <CIcon :name="item.icon" class="h-5 w-5 text-[#B9A2FF]" />
            {{ $t(`services.${item.key}.name`) }}
          </RouterLink>
          <span class="my-2 h-px bg-white/10" aria-hidden="true" />
          <RouterLink
            v-for="item in navigation"
            :key="item.key"
            :to="item.to"
            class="rounded-lg px-3 py-3 text-base text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            :class="{ 'text-[#8F6BFF]': isActive(item) }"
            @click="closeMobileMenu"
          >
            {{ $t(item.key) }}
          </RouterLink>
        </nav>

        <div class="border-t border-white/10 px-5 py-4">
          <RouterLink
            to="/login"
            class="mb-2 flex h-11 items-center justify-center rounded-xl border border-white/15 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
            @click="closeMobileMenu"
          >
            {{ $t("nav.signIn") }}
          </RouterLink>
          <RouterLink
            to="/login"
            class="flex h-12 items-center justify-center rounded-xl bg-[#6633EE] font-medium text-white transition-300 hover:bg-[#6633EE]/80"
            @click="closeMobileMenu"
          >
            {{ $t("nav.cta") }}
          </RouterLink>
        </div>
      </aside>
    </Transition>
  </header>
</template>
