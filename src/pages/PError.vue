<script setup lang="ts">
import { CIcon } from "@/shared/ui"
import CHeader from "@/widgets/header/ui/CHeader.vue"
import spaceUrl from "@/shared/assets/png/404.jpg"
</script>

<template>
  <div class="section-ground min-h-screen">
    <CHeader
      :hide-background="true"
      class="absolute top-0 left-0 right-0 z-50"
    />
    <div
      class="container grid min-h-screen items-center gap-12 py-28 lg:grid-cols-[1fr_0.9fr]"
    >
      <div>
        <!-- 404 Number -->
        <h1
          class="text-[150px] md:text-[200px] font-extrabold leading-none text-gradient-ink"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          {{ $t("error.404") }}
        </h1>

        <!-- Error Message -->
        <h2
          class="text-3xl md:text-4xl font-bold text-sand-950 mt-8 mb-6"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="200"
        >
          {{ $t("error.pageNotFound") }}
        </h2>

        <p
          class="text-lg text-sand-500 mb-12 max-w-[418px]"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          {{ $t("error.message") }}
        </p>

        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
          <RouterLink
            to="/"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sand-950 px-8 font-semibold text-white transition-300 hover:bg-sand-800 sm:w-[411px]"
          >
            {{ $t("error.goBackHome") }}
            <CIcon name="arrow-right" class="h-4 w-4" />
          </RouterLink>
        </div>
      </div>

      <!-- The page used to sit on this photo full-bleed; on the light ground it
           is framed as a window instead. -->
      <img
        :src="spaceUrl"
        alt=""
        width="1912"
        height="1912"
        class="hidden aspect-square w-full rounded-3xl object-cover lg:block"
        data-aos="zoom-in"
        data-aos-duration="1000"
        data-aos-delay="200"
      />
    </div>
  </div>
</template>
