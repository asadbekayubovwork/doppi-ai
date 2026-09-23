<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading, CCountUp } from "@/shared/ui"

interface Point {
  icon: string
  title: string
  desc: string
}

interface Fact {
  label: string
  value: string
}

const points = useI18nList<Point>("about.points")
const facts = useI18nList<Fact>("about.facts")
</script>

<template>
  <section id="about" class="section-ground py-[60px] sm:py-[100px]">

    <div class="container relative z-10">
      <div class="grid items-start gap-12 lg:grid-cols-2">
        <!-- Narrative + facts -->
        <div>
          <CSectionHeading align="left" :title="$t('about.title')" />

          <p
            class="mt-6 text-base leading-relaxed text-sand-800 sm:text-lg"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {{ $t("about.lead") }}
          </p>

          <dl
            class="mt-8 grid grid-cols-1 gap-4 border-t border-sand-200 pt-8 sm:grid-cols-3"
          >
            <div
              v-for="(fact, i) in facts"
              :key="i"
              data-aos="fade-up"
              data-aos-duration="700"
              :data-aos-delay="150 + i * 80"
            >
              <dt class="text-xs uppercase tracking-wide text-sand-500">
                {{ fact.label }}
              </dt>
              <dd class="mt-1 font-semibold text-sand-950">
                <CCountUp :value="fact.value" />
              </dd>
            </div>
          </dl>
        </div>

        <!-- Differentiators -->
        <div class="flex flex-col gap-4">
          <!-- AOS owns the wrapper; the card sits inside so its hover transition survives. -->
          <div
            v-for="(point, i) in points"
            :key="i"
            data-aos="fade-up"
            data-aos-duration="800"
            :data-aos-delay="100 + i * 90"
          >
            <div
              class="surface-card surface-card-lift group flex items-start gap-4 rounded-2xl p-5"
            >
              <span
                class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sand-100 text-sand-950 transition-transform duration-300 group-hover:scale-110"
              >
                <CIcon :name="point.icon" class="h-5 w-5" />
              </span>
              <div>
                <h3 class="font-semibold text-sand-950">{{ point.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-sand-500">
                  {{ point.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
