import type { RouteRecordRaw } from "vue-router"
import { SERVICE_KEYS, SERVICE_PATHS } from "@/shared/config/seoPages"

// One public landing page per service, all rendered by PService.
const serviceRoutes: RouteRecordRaw[] = SERVICE_KEYS.map((service) => ({
  path: SERVICE_PATHS[service],
  name: `Service-${service}`,
  props: { service },
  meta: {
    layout: "DefaultLayout",
  },
  component: () => import("./PService.vue"),
}))

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
  ...serviceRoutes,
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
    path: "/invitations/:token",
    name: "InvitationAccept",
    meta: {
      layout: "EmptyLayout",
      requiresAuth: true,
    },
    component: () => import("./PInvitationAccept.vue"),
  },
  {
    path: "/app",
    name: "DashboardHome",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Home",
      subtitle: "Workspace overview",
    },
    component: () => import("./PDashboardHome.vue"),
  },
  {
    path: "/app/rag",
    name: "RagAgent",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Universal RAG Agent",
      subtitle: "Bilim bazalari va qidiruv sifati",
    },
    component: () => import("./PRagAgent.vue"),
  },
  {
    path: "/app/rag/create",
    name: "RagAgentCreate",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Universal RAG Agent",
      subtitle: "Agent sozlamalari",
    },
    component: () => import("./PRagAgentCreate.vue"),
  },
  {
    path: "/app/rag/playground",
    name: "RagPlayground",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "RAG playground",
      subtitle: "Retrieval va javoblarni real vaqtda tekshirish",
    },
    component: () => import("./PRagPlayground.vue"),
  },
  {
    path: "/app/rag/settings",
    name: "RagAgentSettings",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Universal RAG Agent",
      subtitle: "Agent konfiguratsiyasi",
    },
    component: () => import("./PRagAgentSettings.vue"),
  },
  {
    path: "/app/admin/rag",
    name: "RagAdmin",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "RAG administration",
      subtitle: "Modellar, narxlar va tenant limitlari",
    },
    component: () => import("./PRagAdmin.vue"),
  },
  {
    path: "/app/rag/conversations/:chatId",
    name: "RagConversation",
    props: true,
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      title: "Universal RAG Agent",
      subtitle: "Suhbatlar",
    },
    component: () => import("./PRagConversation.vue"),
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
