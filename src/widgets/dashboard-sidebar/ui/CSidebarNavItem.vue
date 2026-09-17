<script setup lang="ts">
import { computed, ref, useId, watch } from "vue"
import { useRoute } from "vue-router"
import { CIcon } from "@/shared/ui"
import type { NavItem, NavLink } from "../model/navigation"

const props = defineProps<{ item: NavItem }>()

const route = useRoute()
const groupId = useId()

const isInSection = computed(
  () =>
    route.path === props.item.to || route.path.startsWith(`${props.item.to}/`)
)

// Children may point at an anchor on the parent page ("/app/video#plans").
const isChildActive = (child: NavLink) => route.path + route.hash === child.to

const hasChildren = computed(() => Boolean(props.item.children?.length))
const isOpen = ref(isInSection.value)

// Entering a section unfolds it; leaving keeps whatever the user chose.
watch(isInSection, (inside) => {
  if (inside) isOpen.value = true
})
</script>

<template>
  <li>
    <div class="relative">
      <RouterLink
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#9795A2] transition hover:bg-white/[0.06] hover:text-white"
        :class="[
          isInSection ? 'bg-[#28272F] !text-[#F5F5F7]' : '',
          hasChildren ? 'pr-10' : '',
        ]"
      >
        <CIcon
          :name="item.icon"
          class="h-[18px] w-[18px] shrink-0"
          :class="isInSection ? 'text-[#B9A7FF]' : ''"
        />
        <span class="flex-1 truncate">{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="flex h-6 min-w-6 items-center justify-center rounded-lg bg-[#6046E8] px-1.5 text-xs font-bold text-white"
        >
          {{ item.badge }}
        </span>
      </RouterLink>

      <!-- A separate control, so the label always navigates and the chevron
           only folds the group. -->
      <button
        v-if="hasChildren"
        type="button"
        class="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#9795A2] transition hover:bg-white/[0.08] hover:text-white"
        :aria-expanded="isOpen"
        :aria-controls="groupId"
        :aria-label="`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`"
        @click="isOpen = !isOpen"
      >
        <CIcon
          name="chevron-down"
          class="h-4 w-4 transition-transform duration-200"
          :class="isOpen ? 'rotate-180' : ''"
        />
      </button>
    </div>

    <Transition
      enter-active-class="overflow-hidden transition-all duration-200 ease-out"
      enter-from-class="max-h-0 -translate-y-1 opacity-0"
      enter-to-class="max-h-40 translate-y-0 opacity-100"
      leave-active-class="overflow-hidden transition-all duration-150 ease-in"
      leave-from-class="max-h-40 translate-y-0 opacity-100"
      leave-to-class="max-h-0 -translate-y-1 opacity-0"
    >
      <ul
        v-if="hasChildren && isOpen"
        :id="groupId"
        class="mt-1 space-y-1 pl-7"
      >
        <li v-for="child in item.children" :key="child.to">
          <RouterLink
            :to="child.to"
            class="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#9795A2] transition hover:bg-white/[0.06] hover:text-white"
            :class="isChildActive(child) ? 'bg-white/[0.06] !text-white' : ''"
            :aria-current="isChildActive(child) ? 'page' : undefined"
          >
            <CIcon :name="child.icon" class="h-[18px] w-[18px] shrink-0" />
            <span class="flex-1 truncate">{{ child.label }}</span>
            <span
              v-if="child.badge"
              class="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#28272F] px-1.5 text-xs font-semibold text-[#9896A2]"
            >
              {{ child.badge }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </Transition>
  </li>
</template>
