<template>
  <div class="notify-msg">
    {{ getUserInfo(jsonData.o).data?.displayName }}把{{
      jsonData.ms.map((userId) => getUserInfo(userId).data?.displayName).join(', ')
    }}移除了群组
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { getUserInfo } from '@renderer/utils'
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const jsonData = computed(() => {
  try {
    return JSON.parse(atob(props.data.payload.base64edData))
  } catch (e) {
    return {}
  }
})
</script>

<style scoped></style>
