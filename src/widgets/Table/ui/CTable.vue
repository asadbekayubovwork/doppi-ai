<template>
  <div
    class="relative border border-secondary-20 rounded-xl"
    data-aos="fade-up"
    data-aos-duration="1000"
  >
    <table class="w-full">
      <thead class="text-xs text-secondary-60">
        <tr class="border-b border-secondary-20 text-left">
          <th scope="col" class="py-3 w-14"></th>
          <th v-for="head in tableHead" :key="head.id" scope="col" class="py-3">
            {{ head.name }}
          </th>
        </tr>
      </thead>
      <tbody class="text-secondary-100">
        <tr
          v-for="(item, index) in data"
          :key="item.id"
          class="bg-white border-b border-gray-200"
          :data-aos="'fade-up'"
          :data-aos-duration="'800'"
          :data-aos-delay="String(50 * (index + 1))"
        >
          <td scope="row" class="text-center py-4 font-medium">1</td>
          <td
            v-for="head in tableHead"
            :key="head.id"
            scope="row"
            class="py-4 font-medium"
          >
            <slot :name="head.id" :item="item">
              {{ item[head.id] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface TableRow {
  id: string | number
  [column: string]: unknown
}

interface Props {
  data: TableRow[]
  tableHead: {
    id: string
    name: string
  }[]
}

defineProps<Props>()
</script>
