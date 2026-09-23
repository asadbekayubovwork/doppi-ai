import type { RouteRecordRaw } from "vue-router"
import {
  SERVICE_KEYS,
  SERVICE_PATHS,
  type ServiceKey,
} from "@/shared/config/seoPages"

// Every service has its own landing, each built around the chain that service
// runs; PService stays as the fallback for a service added without one.
const SERVICE_PAGES: Partial<Record<ServiceKey, RouteRecordRaw["component"]>> =
  {
    voice: () => import("./PVoiceAgentLanding.vue"),
    rag: () => import("./PRagAgentLanding.vue"),
    video: () => import("./PVideoGeneratorLanding.vue"),
  }

const serviceRoutes: RouteRecordRaw[] = SERVICE_KEYS.map((service) => ({
  path: SERVICE_PATHS[service],
  name: `Service-${service}`,
  props: { service },
  meta: {
    layout: "DefaultLayout",
  },
  component: SERVICE_PAGES[service] ?? (() => import("./PService.vue")),
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
      layout: "AuthLayout",
      guestOnly: true,
    },
    component: () => import("./PLogin.vue"),
  },
  {
    path: "/register",
    name: "Register",
    meta: {
      layout: "AuthLayout",
      guestOnly: true,
    },
    component: () => import("./PRegister.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    meta: {
      layout: "AuthLayout",
      guestOnly: true,
    },
    component: () => import("./PForgotPassword.vue"),
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    meta: {
      layout: "AuthLayout",
    },
    component: () => import("./PAuthCallback.vue"),
  },
  {
    path: "/auth/telegram",
    name: "TelegramAuth",
    meta: {
      layout: "AuthLayout",
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
      heading: "home",
    },
    component: () => import("./PDashboardHome.vue"),
  },
  {
    path: "/app/rag",
    name: "RagAgent",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "rag",
    },
    component: () => import("./PRagAgent.vue"),
  },
  {
    path: "/app/rag/create",
    name: "RagAgentCreate",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "ragCreate",
    },
    component: () => import("./PRagAgentCreate.vue"),
  },
  {
    path: "/app/rag/playground",
    name: "RagPlayground",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "ragPlayground",
    },
    component: () => import("./PRagPlayground.vue"),
  },
  {
    path: "/app/rag/settings",
    name: "RagAgentSettings",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "ragSettings",
    },
    component: () => import("./PRagAgentSettings.vue"),
  },
  {
    path: "/app/admin/rag",
    name: "RagAdmin",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "ragAdmin",
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
      heading: "ragConversation",
    },
    component: () => import("./PRagConversation.vue"),
  },
  {
    path: "/app/voice",
    name: "VoiceAgentApp",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "voice",
    },
    component: () => import("./PVoiceAgentApp.vue"),
  },
  {
    path: "/app/video",
    name: "VideoGenerator",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "video",
    },
    component: () => import("./PVideoGenerator.vue"),
  },
  {
    path: "/app/video/plans",
    name: "VideoPlans",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "videoPlans",
    },
    component: () => import("./PVideoPlans.vue"),
  },
  {
    path: "/app/video/new",
    name: "VideoStudio",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "videoNew",
    },
    component: () => import("./PVideoStudio.vue"),
  },
  {
    path: "/app/usage",
    name: "UsageBilling",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "usage",
    },
    component: () => import("./PUsageBilling.vue"),
  },
  {
    path: "/app/team",
    name: "TeamApp",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "team",
    },
    component: () => import("./PTeamApp.vue"),
  },
  {
    path: "/app/settings",
    name: "Settings",
    meta: {
      layout: "DashboardLayout",
      requiresAuth: true,
      heading: "settings",
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
