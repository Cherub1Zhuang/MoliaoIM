<template>
  <div class="w-50 rounded-md overflow-hidden">
    <img v-if="json_data?.media?.[0]?.remotePath" :src="json_data.media[0].remotePath" alt="" />
    <span v-else>error:{{ props.data }}</span>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  data: {
    type: String,
    default: ''
  }
})

const json_data = computed(() => {
  try {
    return JSON.parse(props.data)
  } catch (e) {
    return {}
  }
})
</script>

<style scoped></style>
