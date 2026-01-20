<template>
  <div ref="msgsRef" class="w-full h-full overflow-auto flex flex-col gap-6 p-2">
    <div v-for="(msg, index) in st.sort_current_conv_msgs" :key="index">
      <div v-if="showTime(index)" class="notify-msg mb-1">
        {{ formatWeChatTime(msg.timestamp) }}
      </div>
      <div class="flex items-start gap-2">
        <message class="flex-1" :message="msg" @edit-msg="$emit('edit-msg', msg)" @quote-msg="$emit('quote-msg', msg)" />
        <div
          class="pt-2"
          v-if="
            showMulSelect &&
            [
              MessageTypes.TEXT,
              MessageTypes.IMAGE,
              MessageTypes.Multiple,
              MessageTypes.FILE,
              MessageTypes.Name_Card,
              MessageTypes.Composited,
              MessageTypes.Voice
            ].includes(msg.payload.type)
          "
          @click="toggleMsg(msg.messageId)"
        >
          <Icon
            v-if="selectedList.includes(msg.messageId)"
            name="checked"
            size="16"
            color="#07c160"
          />
          <div v-else class="w-[16px] h-[16px] rounded-full border-2 border-gray-300"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount, provide,inject } from 'vue'
import message from './message.vue'
import { useUserStore } from '@renderer/stores/user'
import { formatWeChatTime } from '@renderer/utils'
import { MessageTypes } from '@renderer/constant'
const emit = defineEmits(['update-online-status', 'edit-msg', 'quote-msg'])
const selectedList = ref([])
const showMulSelect = inject('showMulSelect')
const toggleMsg = (msgId) => {
  const index = selectedList.value.indexOf(msgId)
  if (index > -1) {
    selectedList.value.splice(index, 1)
  } else {
    selectedList.value.push(msgId)
  }
}
const st = useUserStore()
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})
const msgsRef = ref(null)
const scrollToBottom = () => {
  const el = msgsRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}
watch(
  () => st.current_conv_msgs,
  () => {
    // nextTick(scrollToBottom)
    setTimeout(scrollToBottom, 200)
    emit('update-online-status')
  },
  { deep: true }
)
// 自动滚动到底部
// watch(
//   () => st.current_conv_msgs,
//   () => {
//     nextTick(() => {
//       if (msgsRef.value) {
//         msgsRef.value.scrollTop = msgsRef.value.scrollHeight
//       }
//     })
//   },
//   { deep: true }
// )
const showTime = (index) => {
  if (index === 0) return true
  const curr = st.current_conv_msgs[index]
  const prev = st.current_conv_msgs[index - 1]
  return curr.timestamp - prev.timestamp > 5 * 60 * 1000
}
</script>

<style scoped></style>
