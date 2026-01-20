<template>
  <div class="notify-msg">
    {{ getUserInfo(jsonData.o).data?.displayName }}邀请{{
      jsonData.ms.map((userId) => getUserInfo(userId).data?.displayName).join(', ')
    }}加入了群聊
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
    return JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(props.data.payload.base64edData), (c) => c.charCodeAt(0))
      )
    )
  } catch (e) {
    return {}
  }
})
</script>

<style scoped></style>
