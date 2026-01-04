<template>
  <div class="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center shrink-0">
    <img :src="url" alt="" class="w-full h-full object-cover" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  url: {
    type: String,
    default: ''
  }
})
</script>

<style scoped></style>
