// src/app/providers/router.ts
import { createRouter, createWebHistory } from "vue-router"
import { routes } from "@/pages"
import { useAuthStore } from "@/features/auth"
import { pinia } from "./pinia"
import { safeLocalPath } from "@/features/auth/model/redirect"
import { platformAdminApi } from "@/features/platform-admin"

/**
 * Pages swap with an `out-in` transition, so the next page mounts only after
 * the current one has faded out — an anchor on another page (the footer's
 * /about#team) is not in the DOM yet when scrollBehavior runs. Wait for it.
 */
const waitForElement = (id: string, timeout = 2000) =>
  new Promise<HTMLElement | null>((resolve) => {
    const started = performance.now()
    const check = () => {
      const el = document.getElementById(id)
      if (el || performance.now() - started > timeout) resolve(el)
      else requestAnimationFrame(check)
    }
    check()
  })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  async scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      const el = await waitForElement(decodeURIComponent(to.hash.slice(1)))
      // Header is fixed, so anchor targets are offset to stay clear of it.
      if (el) return { el, top: 90, behavior: "smooth" }
      return to.path === from.path ? false : { top: 0 }
    }
    return savedPosition || { top: 0 }
  },
})

// Dev-only escape hatch for UI work while the backend is unavailable.
const authBypass =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === "true"

router.beforeEach(async (to) => {
  if (authBypass && to.meta.requiresAuth === true) return true

  const auth = useAuthStore(pinia)
  const needsSession =
    to.meta.requiresAuth === true || to.meta.guestOnly === true

  if (needsSession && auth.status === "unknown") await auth.bootstrap()

  if (to.meta.requiresAuth === true && !auth.isAuthenticated) {
    return {
      name: "Login",
      query: { redirect: safeLocalPath(to.fullPath) },
    }
  }

  if (to.meta.guestOnly === true && auth.isAuthenticated) {
    return safeLocalPath(to.query.redirect)
  }

  if (to.meta.requiresAdmin === true && auth.isAuthenticated) {
    try {
      await platformAdminApi.me()
    } catch {
      return { name: "DashboardHome" }
    }
  }

  return true
})

export { router, safeLocalPath }
