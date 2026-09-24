<script setup lang="ts">
import { ref } from "vue"
import { useI18nList } from "@/shared/lib"
import { CIcon, CSectionHeading } from "@/shared/ui"

interface FaqItem {
  q: string
  a: string
}

const props = withDefaults(
  defineProps<{
    /** i18n node holding `title` and `items`: the home FAQ, or a page's own. */
    base?: string
  }>(),
  { base: "faq" }
)

const items = useI18nList<FaqItem>(`${props.base}.items`)

// Single-open accordion: clicking the open row closes it again.
const openIndex = ref<number | null>(0)
const toggle = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}

/**
 * Animates the panel's real content height instead of a fixed `max-height` cap.
 * With a cap, a collapse spends most of its duration travelling from the cap
 * down to the content height — invisibly — so the row being closed looked like
 * it lagged behind the row being opened. Driving `height` from `scrollHeight`
 * keeps both halves of the swap in lockstep.
 */
const onEnter = (element: Element) => {
  const el = element as HTMLElement
  el.style.height = "0px"
  el.style.opacity = "0"
  void el.offsetHeight // flush the start state before transitioning
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = "1"
}

const onLeave = (element: Element) => {
  const el = element as HTMLElement
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = "1"
  void el.offsetHeight
  el.style.height = "0px"
  el.style.opacity = "0"
}

// Hand control of the height back to the layout once the panel is fully open.
const onTransitionDone = (element: Element) => {
  const el = element as HTMLElement
  el.style.height = ""
  el.style.opacity = ""
}
</script>

<template>
  <section id="faq" class="section-ground py-[60px] sm:py-[100px]">
    <div class="container relative z-10">
      <CSectionHeading :title="$t(`${base}.title`)" />

      <div class="mx-auto mt-12 max-w-[760px] space-y-3">
        <!-- The AOS-animated element must keep a STATIC class list: AOS adds
             `aos-animate` straight to the DOM, and a dynamic :class here would
             make Vue rewrite the attribute on every toggle, dropping that class
             and fading the whole row out. Open-state styling lives inside. -->
        <div
          v-for="(item, i) in items"
          :key="i"
          data-aos="fade-up"
          data-aos-duration="700"
          :data-aos-delay="100 + i * 70"
        >
          <div
            class="surface-card overflow-hidden rounded-2xl"
            :class="openIndex === i ? 'border-sand-300 bg-sand-50' : ''"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
              :aria-expanded="openIndex === i"
              :aria-controls="`faq-panel-${i}`"
              @click="toggle(i)"
            >
              <span class="text-base font-medium text-sand-950 sm:text-lg">{{ item.q }}</span>
              <CIcon
                name="chevron-down"
                class="h-5 w-5 shrink-0 text-sand-500 transition-transform duration-300"
                :class="openIndex === i ? 'rotate-180' : ''"
              />
            </button>

            <Transition
              name="faq"
              @enter="onEnter"
              @after-enter="onTransitionDone"
              @leave="onLeave"
              @after-leave="onTransitionDone"
            >
              <div v-show="openIndex === i" :id="`faq-panel-${i}`" class="faq-panel">
                <p class="px-5 pb-5 text-sm leading-relaxed text-sand-600 sm:text-base">
                  {{ item.a }}
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-panel {
  overflow: hidden;
}

/* Same duration and easing both ways, so an open and a close that happen in the
   same click stay visually in sync. */
.faq-enter-active,
.faq-leave-active {
  transition:
    height 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
}
</style>
