import type { RouteRecordRaw } from "vue-router"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    meta: {
      layout: "DefaultLayout",
    },
    component: () => import("./PIndex.vue"),
  },
  {
    path: "/product",
    name: "Product",
    meta: {
      layout: "DefaultLayout",
    },
    component: () => import("./PProduct.vue"),
  },
  {
    path: "/about",
    name: "About",
    meta: {
      layout: "DefaultLayout",
    },
    component: () => import("./PAboutUs.vue"),
  },
  {
    path: "/pricing",
    name: "Pricing",
    meta: {
      layout: "DefaultLayout",
    },
    component: () => import("./PPricing.vue"),
  },
  {
    path: "/contact-us",
    name: "Contact",
    meta: {
      layout: "DefaultLayout",
    },
    component: () => import("./PContact.vue"),
  },
  {
    path: "/privacy",
    name: "Privacy",
    meta: {
      layout: "DefaultLayout",
    },
    component: () => import("./PPrivacy.vue"),
  },
  {
    path: "/terms",
    name: "Terms",
    meta: {
      layout: "DefaultLayout",
    },
    component: () => import("./PTerms.vue"),
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      layout: "EmptyLayout",
      guestOnly: true,
    },
    component: () => import("./PLogin.vue"),
  },
  {
    path: "/register",
    name: "Register",
    meta: {
      layout: "EmptyLayout",
      guestOnly: true,
    },
    component: () => import("./PRegister.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    meta: {
      layout: "EmptyLayout",
      guestOnly: true,
    },
    component: () => import("./PForgotPassword.vue"),
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    meta: {
      layout: "EmptyLayout",
    },
    component: () => import("./PAuthCallback.vue"),
  },
  {
    path: "/auth/telegram",
    name: "TelegramAuth",
    meta: {
      layout: "EmptyLayout",
      guestOnly: true,
    },
    component: () => import("./PTelegramAuth.vue"),
  },
  {
    path: "/app",
    redirect: "/app/rag",
    meta: { requiresAuth: true },
  },
  {
    path: "/app/rag",
    name: "RagAgent",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Universal RAG agent",
      subtitle: "Bilim bazalari va qidiruv sifati",
    },
    component: () => import("./PRagAgent.vue"),
  },
  {
    path: "/app/voice",
    name: "VoiceAgentApp",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Ovozli agent",
      subtitle: "Qo'ng'iroqlar, ssenariylar va raqamlar",
    },
    component: () => import("./PVoiceAgentApp.vue"),
  },
  {
    path: "/app/video",
    name: "VideoGenerator",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Video generator",
      subtitle: "Promptdan tayyor videogacha",
    },
    component: () => import("./PVideoGenerator.vue"),
  },
  {
    path: "/app/usage",
    name: "UsageBilling",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Sarf va to'lovlar",
      subtitle: "Balans, limitlar va hisob-fakturalar",
    },
    component: () => import("./PUsageBilling.vue"),
  },
  {
    path: "/app/api-keys",
    name: "ApiKeys",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "API kalitlar",
      subtitle: "Integratsiyalar uchun kalitlar",
    },
    component: () => import("./PApiKeys.vue"),
  },
  {
    path: "/app/team",
    name: "TeamApp",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Jamoa",
      subtitle: "A'zolar va ruxsatlar",
    },
    component: () => import("./PTeamApp.vue"),
  },
  {
    path: "/app/settings",
    name: "Settings",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Sozlamalar",
      subtitle: "Ish maydoni va biznes sozlamalari",
    },
    component: () => import("./PSettings.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    meta: {
      layout: "EmptyLayout",
    },
    component: () => import("./PError.vue"),
  },
]

export { routes }
