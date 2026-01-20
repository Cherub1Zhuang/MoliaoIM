<template>
  <div class="notify-msg">
    {{
      props.data.sender === st.userinfo.userId
        ? '你'
        : getUserInfo(props.data.sender).data?.displayName
    }}{{ jsonData.n === '1' ? '开启全员禁言' : '关闭全员禁言' }}
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { getUserInfo } from '@renderer/utils'
import { useUserStore } from '../../../../stores/user'
const st = useUserStore()
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
