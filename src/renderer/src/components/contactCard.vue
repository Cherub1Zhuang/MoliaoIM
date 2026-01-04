<template>
  <div class="h-[60px] px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-4">
    <img :src="data.portrait" alt="" class="rounded-full w-10 h-10" />
    <span>{{ data.type === 0 ? data.displayName : data.name }}</span>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped></style>
