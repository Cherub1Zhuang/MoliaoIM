<template>
  <div ref="msgsRef" class="w-full h-full overflow-auto flex flex-col gap-6 p-2">
    <message v-for="(msg, index) in st.current_conv_msgs" :key="index" :message="msg" />
  </div>
</template>
<script setup>
import { ref, watch, nextTick } from 'vue'
import message from './message.vue'
import { useUserStore } from '@renderer/stores/user'
const st = useUserStore()
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})
const msgsRef = ref(null)
// 自动滚动到底部
watch(
  () => st.current_conv_msgs,
  () => {
    nextTick(() => {
      if (msgsRef.value) {
        msgsRef.value.scrollTop = msgsRef.value.scrollHeight
      }
    })
  },
  { deep: true }
)
</script>

<style scoped></style>
