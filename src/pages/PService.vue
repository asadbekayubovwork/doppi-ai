<script setup lang="ts">
import { useSeo } from "@/shared/lib"
import { SERVICE_PATHS, type ServiceKey } from "@/shared/config/seoPages"
import {
  CServiceHero,
  CServiceFeatures,
  CServiceSteps,
  CServiceLinks,
  CServiceCta,
  CFaq,
} from "@/widgets"

const props = defineProps<{ service: ServiceKey }>()

useSeo(() => SERVICE_PATHS[props.service])

// The root is keyed by service: moving between two service pages reuses this
// component, and the key remounts every section with the new service's copy.
</script>

<template>
  <div :key="service">
    <CServiceHero :service="service" />
    <CServiceFeatures :service="service" />
    <CServiceSteps :service="service" />
    <CFaq :i18n-key="`services.${service}.faq`" />
    <CServiceLinks :exclude="service" />
    <CServiceCta :service="service" />
  </div>
</template>
