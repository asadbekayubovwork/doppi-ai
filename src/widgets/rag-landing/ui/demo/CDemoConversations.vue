<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon, CAppWindow } from "@/shared/ui"

interface Chat {
  name: string
  time: string
  snippet: string
  unread: number
}

interface Message {
  role: "client" | "agent"
  text: string
  time: string
}

interface Chip {
  icon: string
  label: string
  tone: "neutral" | "success" | "accent"
}

// Step 03: the same conversation, waiting in the CRM for whoever picks it up.
const base = "services.rag.landing.demo.crm"
const chats = useI18nList<Chat>(`${base}.chats`)
const messages = useI18nList<Message>(`${base}.messages`)
const chips = useI18nList<Chip>(`${base}.chips`)

const CHIP_CLASS: Record<Chip["tone"], string> = {
  neutral: "bg-[#FAFAF9] text-[#6A6A74]",
  success: "bg-[#E6F4EC] text-[#177A46]",
  accent: "bg-[#EFECFF] text-[#5B4BE8]",
}
</script>

<template>
  <CAppWindow :title="$t(`${base}.window`)" :label="$t(`${base}.alt`)">
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-[18px] py-3.5"
    >
      <span class="flex items-center gap-2.5">
        <span class="text-base font-semibold tracking-[-0.3px] text-[#15151B]">
          {{ $t(`${base}.title`) }}
        </span>
        <span
          class="flex items-center gap-1.5 rounded-full bg-[#E6F4EC] px-2.5 py-1 text-[11.5px] font-semibold text-[#177A46]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#177A46]" />
          {{ $t(`${base}.badge`) }}
        </span>
      </span>

      <span class="flex items-center gap-2">
        <span
          v-for="tool in [
            { icon: 'send', label: $t(`${base}.telegram`) },
            { icon: 'download', label: $t(`${base}.export`) },
          ]"
          :key="tool.icon"
          class="flex items-center gap-1.5 rounded-lg border border-[#E5E5E1] px-[11px] py-[7px] text-[12.5px] text-[#6A6A74]"
        >
          <CIcon :name="tool.icon" class="h-[13px] w-[13px] text-[#84848E]" />
          {{ tool.label }}
        </span>
      </span>
    </div>

    <div class="flex border-t border-[#E5E5E1]">
      <!-- Chat list: a second pane only once there is room for one. -->
      <div
        class="hidden w-[232px] shrink-0 flex-col border-r border-[#E5E5E1] bg-[#FAFAF9] sm:flex"
      >
        <div class="p-3.5">
          <span
            class="flex items-center gap-1.5 rounded-lg border border-[#E5E5E1] bg-white px-2.5 py-2 text-[12.5px] text-[#84848E]"
          >
            <CIcon name="search" class="h-[13px] w-[13px]" />
            {{ $t(`${base}.search`) }}
          </span>
        </div>

        <div
          v-for="(chat, i) in chats"
          :key="chat.name"
          class="flex items-center gap-2.5 px-3.5 py-2.5"
          :class="i === 0 ? 'bg-white' : ''"
        >
          <span
            class="h-8 w-8 shrink-0 rounded-full"
            :class="i === 0 ? 'bg-[#5B4BE8]' : 'bg-[#D8D8D3]'"
          />
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="flex items-center justify-between gap-1.5">
              <span class="truncate text-[12.5px] font-semibold text-[#15151B]">
                {{ chat.name }}
              </span>
              <span class="shrink-0 text-[10.5px] text-[#84848E]">{{
                chat.time
              }}</span>
            </span>
            <span class="flex items-center justify-between gap-1.5">
              <span class="truncate text-[11.5px] text-[#6A6A74]">{{
                chat.snippet
              }}</span>
              <span
                v-if="chat.unread"
                class="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full bg-[#5B4BE8] text-[10px] font-semibold text-white"
              >
                {{ chat.unread }}
              </span>
            </span>
          </span>
        </div>
      </div>

      <!-- The open conversation -->
      <div class="flex min-w-0 flex-1 flex-col">
        <div
          class="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
        >
          <span class="flex items-center gap-2.5">
            <span class="h-8 w-8 shrink-0 rounded-full bg-[#5B4BE8]" />
            <span class="flex flex-col">
              <span class="text-[13.5px] font-semibold text-[#15151B]">
                {{ $t(`${base}.contact`) }}
              </span>
              <span class="text-[11px] text-[#84848E]">{{
                $t(`${base}.contactSub`)
              }}</span>
            </span>
          </span>
          <span
            class="flex items-center gap-1.5 rounded-full bg-[#EFECFF] px-2.5 py-1.5 text-[11.5px] font-semibold text-[#5B4BE8]"
          >
            <CIcon name="sparkles" class="h-3 w-3" />
            {{ $t(`${base}.agentBadge`) }}
          </span>
        </div>

        <div class="flex flex-1 flex-col gap-2.5 bg-[#FAFAF9] px-4 py-3.5">
          <div
            v-for="(message, i) in messages"
            :key="i"
            class="flex"
            :class="message.role === 'agent' ? 'justify-end' : 'justify-start'"
          >
            <span
              class="flex max-w-[86%] flex-col gap-0.5 px-[11px] pb-1 pt-2"
              :class="
                message.role === 'agent'
                  ? 'rounded-[12px_12px_4px_12px] bg-[#5B4BE8]'
                  : 'rounded-[12px_12px_12px_4px] border border-[#E5E5E1] bg-white'
              "
            >
              <span
                class="text-xs leading-[17px]"
                :class="
                  message.role === 'agent' ? 'text-white' : 'text-[#15151B]'
                "
              >
                {{ message.text }}
              </span>
              <span
                class="text-right text-[9.5px]"
                :class="
                  message.role === 'agent' ? 'text-[#DCD7FF]' : 'text-[#84848E]'
                "
              >
                {{ message.time }}
              </span>
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 px-4 py-2.5">
          <span
            v-for="chip in chips"
            :key="chip.label"
            class="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] font-medium"
            :class="CHIP_CLASS[chip.tone]"
          >
            <CIcon :name="chip.icon" class="h-3 w-3" />
            {{ chip.label }}
          </span>
        </div>
      </div>
    </div>
  </CAppWindow>
</template>
