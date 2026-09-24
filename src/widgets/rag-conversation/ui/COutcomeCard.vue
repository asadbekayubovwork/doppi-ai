<script setup lang="ts">
import { computed, nextTick, ref } from "vue"
import type { CustomerRating } from "@/entities/rag-agent"
import { CIcon } from "@/shared/ui"
import CInsightCard from "./CInsightCard.vue"

const props = defineProps<{
  tags: string[]
  rating: CustomerRating | null
}>()

const emit = defineEmits<{ "update:tags": [tags: string[]] }>()

const isAdding = ref(false)
const draft = ref("")
const input = ref<HTMLInputElement | null>(null)

const isHappy = computed(
  () => !!props.rating && props.rating.score / props.rating.outOf >= 0.6
)

const startAdding = async () => {
  isAdding.value = true
  await nextTick()
  input.value?.focus()
}

// Tags are slugs, so "Wholesale order" and "wholesale-order" don't diverge.
const commit = () => {
  const tag = draft.value.trim().toLowerCase().replace(/\s+/g, "-")
  if (tag && !props.tags.includes(tag))
    emit("update:tags", [...props.tags, tag])
  cancel()
}

const cancel = () => {
  draft.value = ""
  isAdding.value = false
}

const remove = (tag: string) =>
  emit(
    "update:tags",
    props.tags.filter((item) => item !== tag)
  )
</script>

<template>
  <CInsightCard :title="$t('dashboard.rag.conversation.outcome.title')" icon="tag">
    <div class="space-y-3 p-4">
      <ul
        class="flex flex-wrap items-center gap-1.5"
        :aria-label="$t('dashboard.rag.conversation.outcome.tags')"
      >
        <li
          v-for="tag in tags"
          :key="tag"
          class="inline-flex h-7 items-center gap-1 rounded-full border border-[#E5E5E1] bg-white pl-2.5 pr-1 text-xs font-medium text-[#3F3F46]"
        >
          {{ tag }}
          <button
            type="button"
            class="flex h-5 w-5 items-center justify-center rounded-full text-[#A1A1AA] transition hover:bg-[#F2F2EF] hover:text-[#15151B]"
            :aria-label="$t('dashboard.rag.conversation.outcome.removeTag', { tag })"
            @click="remove(tag)"
          >
            <CIcon name="x" class="h-3 w-3" />
          </button>
        </li>
        <li>
          <input
            v-if="isAdding"
            ref="input"
            v-model="draft"
            maxlength="24"
            placeholder="new-tag"
            :aria-label="$t('dashboard.rag.conversation.outcome.newTag')"
            class="h-7 w-28 rounded-full border border-[#5B4BE8] px-2.5 text-xs text-[#15151B] outline-none ring-2 ring-[#5B4BE8]/15"
            @keydown.enter.prevent="commit"
            @keydown.esc="cancel"
            @blur="commit"
          />
          <button
            v-else
            type="button"
            class="inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-[#6A6A74] transition hover:bg-[#F2F2EF] hover:text-[#15151B]"
            @click="startAdding"
          >
            <CIcon name="plus" class="h-3.5 w-3.5" />
            {{ $t("dashboard.rag.conversation.outcome.add") }}
          </button>
        </li>
      </ul>

      <div
        v-if="rating"
        class="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
        :class="
          isHappy
            ? 'bg-[#E7F6EC] text-[#177A46]'
            : 'bg-[#FFF1E0] text-[#B45309]'
        "
      >
        <CIcon name="smile" class="mt-0.5 h-4 w-4 shrink-0" />
        <div class="min-w-0">
          <p class="text-[13px] font-semibold">
            {{
              $t("dashboard.rag.conversation.outcome.rated", {
                score: rating.score,
                outOf: rating.outOf,
              })
            }}
          </p>
          <p v-if="rating.comment" class="mt-0.5 text-xs">
            “{{ rating.comment }}”
          </p>
        </div>
      </div>
      <p v-else class="text-xs text-[#84848E]">
        {{ $t("dashboard.rag.conversation.outcome.notRated") }}
      </p>
    </div>
  </CInsightCard>
</template>
