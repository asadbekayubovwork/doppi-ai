import { RouteLocationNormalizedLoaded, Router } from "vue-router"

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $route: RouteLocationNormalizedLoaded
    $router: Router
  }
}

declare module "vue-router" {
  interface RouteMeta {
    layout?: string
    /** Heading shown by the dashboard header. */
    title?: string
    subtitle?: string
  }
}

export {}
