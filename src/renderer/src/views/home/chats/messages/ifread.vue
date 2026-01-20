<template>
  <span class="inline-block">
    <Icon v-if="json_extra?.read" name="read" size="10" />
    <Icon v-else name="unread" size="10" />
  </span>
</template>
<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  extra: {
    type: String,
    default: ''
  }
})
const json_extra = computed(() => {
  try {
    return JSON.parse(props.extra)
  } catch (e) {
    // console.error('解析消息extra失败:', props.extra)
    // console.error('解析消息extra失败:', e)
    return null
  }
})
</script>

<style scoped></style>
