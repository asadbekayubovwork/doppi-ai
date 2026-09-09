<script setup lang="ts">
import { useRouter } from "vue-router"
import { CButton } from "@/shared/ui"
import CHeader from "@/widgets/header/ui/CHeader.vue"

const router = useRouter()

const goHome = () => {
  router.push("/")
}
</script>

<template>
  <div class="min-h-screen custom-class">
    <CHeader
      :hide-background="true"
      class="absolute top-0 left-0 right-0 z-50"
    />
    <div class="container h-[calc(100vh-88px)] flex flex-col justify-center">
      <!-- 404 Number -->
      <h1
        class="text-[150px] md:text-[200px] font-extrabold text-white leading-none"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        {{ $t("error.404") }}
      </h1>

      <!-- Error Message -->
      <h2
        class="text-3xl md:text-4xl font-bold text-white mt-8 mb-6"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="200"
      >
        {{ $t("error.pageNotFound") }}
      </h2>

      <p
        class="text-lg text-secondary-60 mb-12 max-w-[418px]"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="300"
      >
        {{ $t("error.message") }}
      </p>

      <!-- Action Buttons -->
      <div
        class="flex flex-col sm:flex-row gap-4 items-center"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="400"
      >
        <CButton
          :label="$t('error.goBackHome')"
          variant="primary"
          size="large"
          class="sm:w-[411px] w-full h-12 font-semibold"
          @click="goHome"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-class {
  background: url("@/shared/assets/png/404.jpg") no-repeat center center;
  background-color: #000000;
  background-size: contain;
  background-position: right center;
}
</style>
