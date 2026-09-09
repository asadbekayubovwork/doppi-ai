<script setup lang="ts">
import { CIcon, CSectionHeading } from "@/shared/ui"
import { TEAM_MEMBERS, realSocials } from "../model/members"

/**
 * Photo-forward portrait cards.
 *
 * The photo fills the top of the card and carries the name/role over a
 * gradient; the bio sits on the panel below. Hovering warms the photo from
 * grayscale to colour, zooms it slightly and floats the social links up.
 * Three per row keeps the bio readable, so five members read as 3 + 2 centred.
 */
</script>

<template>
  <section id="team" class="section-dark py-[60px] sm:py-[100px]">
    <div class="violet-glow left-1/4 top-0 h-64 w-[30rem]" aria-hidden="true" />

    <div class="container relative z-10">
      <CSectionHeading
        :eyebrow="$t('team.eyebrow')"
        :title="$t('team.title')"
        :subtitle="$t('team.subtitle')"
      />

      <!-- Flex-wrap rather than a grid so an incomplete last row stays centred. -->
      <ul class="mt-14 flex flex-wrap justify-center gap-5">
        <li
          v-for="(member, i) in TEAM_MEMBERS"
          :key="member.id"
          class="group w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.34px)]"
          data-aos="fade-up"
          data-aos-duration="800"
          :data-aos-delay="100 + i * 90"
        >
          <!-- The lift transform lives on the <article> and the clipping on the
               wrapper inside it. Doing both on one element makes Chrome mask a
               rounded, composited layer, which flashes a seam along the photo's
               bottom edge while the card animates. -->
          <article class="surface-card surface-card-lift flex h-full flex-col rounded-2xl">
            <div class="flex flex-1 flex-col overflow-hidden rounded-[15px]">
              <!-- The panel below overlaps by a pixel: with a fractional card
                   width the photo box can otherwise end half a pixel short and
                   let a hairline of the card's hover tint through. -->
              <div class="relative -mb-px aspect-square overflow-hidden bg-ground">
                <img
                  v-if="member.image"
                  :src="member.image"
                  :alt="member.name"
                  width="480"
                  height="480"
                  loading="lazy"
                  class="photo-zoom h-full w-full object-cover object-top transition-[transform,filter] duration-500 ease-out [@media(hover:hover)]:grayscale [@media(hover:hover)]:group-hover:grayscale-0"
                />
                <span
                  v-else
                  aria-hidden="true"
                  class="grid h-full w-full place-items-center bg-gradient-to-br from-[#6633EE]/40 to-[#6633EE]/10 text-5xl font-bold text-[#C9B8FF]"
                >
                  {{ member.initials }}
                </span>

                <!-- Grounds the photo in the section colour so the name stays legible. -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-ground via-ground/40 to-transparent"
                  aria-hidden="true"
                />
                <!-- Fades back to transparent before the bottom edge; a wash at
                     full strength there cuts off against the panel as a line. -->
                <div
                  class="absolute inset-0 bg-[linear-gradient(to_top,transparent_0%,rgba(102,51,238,0.45)_22%,transparent_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />

                <div class="absolute inset-x-0 bottom-0 p-5">
                  <h3 class="text-lg font-semibold leading-snug text-white">{{ member.name }}</h3>
                  <p class="mt-0.5 text-sm font-medium text-[#B9A2FF]">
                    {{ $t(`team.roles.${member.id}`) }}
                  </p>
                </div>
              </div>

              <div class="flex flex-1 flex-col p-5">
                <!-- Three lines are reserved either way, so every card's social
                     row lands on the same baseline whatever the bio's length. -->
                <p class="line-clamp-3 min-h-[4.25rem] text-sm leading-relaxed text-[#A3A3A3]">
                  {{ $t(`team.bios.${member.id}`) }}
                </p>

                <div
                  v-if="realSocials(member).length"
                  class="hover-reveal mt-auto flex items-center gap-2 pt-4"
                >
                  <a
                    v-for="social in realSocials(member)"
                    :key="social.label"
                    :href="social.href"
                    target="_blank"
                    rel="noreferrer"
                    :aria-label="`${member.name} — ${social.label}`"
                    class="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#A3A3A3] transition-colors duration-200 hover:border-[#6633EE]/50 hover:bg-[#6633EE]/15 hover:text-white"
                  >
                    <CIcon :name="social.icon" class="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        </li>
      </ul>
    </div>
  </section>
</template>
