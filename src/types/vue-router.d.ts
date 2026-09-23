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
    /**
     * Key of the dashboard header's heading: `dashboard.routes.<heading>` in
     * the locale files holds its title and subtitle.
     */
    heading?: string
  }
}

export {}
