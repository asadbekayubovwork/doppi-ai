import { I18n } from "vue-i18n"

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $t: ReturnType<I18n["global"]["t"]>
  }
}
