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
    },
    component: () => import("./PLogin.vue"),
  },
  {
    path: "/register",
    name: "Register",
    meta: {
      layout: "EmptyLayout",
    },
    component: () => import("./PRegister.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    meta: {
      layout: "EmptyLayout",
    },
    component: () => import("./PLogin.vue"),
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
