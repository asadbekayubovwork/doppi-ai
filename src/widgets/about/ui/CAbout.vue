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
  <section id="about" class="section-dark py-[60px] sm:py-[100px]">
    <div
      class="violet-glow right-1/4 top-0 h-64 w-[30rem]"
      aria-hidden="true"
    />

    <div class="container relative z-10">
      <div class="grid items-start gap-12 lg:grid-cols-2">
        <!-- Narrative + facts -->
        <div>
          <CSectionHeading
            align="left"
            :eyebrow="$t('about.eyebrow')"
            :title="$t('about.title')"
          />

          <p
            class="mt-6 text-base leading-relaxed text-white/90 sm:text-lg"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {{ $t("about.lead") }}
          </p>
          <p
            class="mt-4 leading-relaxed text-[#A3A3A3]"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="100"
          >
            {{ $t("about.vision") }}
          </p>

          <dl
            class="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-3"
          >
            <div
              v-for="(fact, i) in facts"
              :key="i"
              data-aos="fade-up"
              data-aos-duration="700"
              :data-aos-delay="150 + i * 80"
            >
              <dt class="text-xs uppercase tracking-wide text-[#A3A3A3]">
                {{ fact.label }}
              </dt>
              <dd class="mt-1 font-semibold text-white">
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
                class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#6633EE]/15 text-[#B9A2FF] transition-transform duration-300 group-hover:scale-110"
              >
                <CIcon :name="point.icon" class="h-5 w-5" />
              </span>
              <div>
                <h3 class="font-semibold text-white">{{ point.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-[#A3A3A3]">
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
