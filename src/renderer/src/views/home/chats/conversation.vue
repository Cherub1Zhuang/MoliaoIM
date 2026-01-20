<template>
  <div class="flex flex-col w-full h-full min-h-0">
    <div class="h-16 border-b border-gray-200 flex items-center px-3 drag shrink-0">
      <div class="flex items-end gap-2">
        {{
          route.query.conversationType === '0' ? route.query.receiverAlias : route.query.groupAlias
        }}
        <span
          v-if="route.query.conversationType === '0'"
          class="text-[10px] text-gray-500 leading-5"
          >{{
            onlineStatus.overallStatus === -1
              ? '离线'
              : onlineStatus.overallStatus === 0
                ? '在线'
                : onlineStatus.lastSeenText
          }}</span
        >
      </div>
    </div>
    <div class="flex-1 min-h-0"></div>
    <messages
      class="w-full h-full"
      :key="route.fullPath"
      :messages="messagesList"
      @update-online-status="getOnlineStatus"
      @edit-msg="handleEditMsg"
      @quote-msg="handleQuoteMsg"
    />
    <div
      class="w-full relative border-t border-gray-200"
      :style="{
        height: send_height + 'px'
      }"
    >
      <sendInput
        ref="sendInputRef"
        class="w-full h-full"
        :key="route.fullPath"
        :target="route.params.target"
        :type="Number(route.query.conversationType)"
        @send-message="send_message"
      />
      <div
        class="w-full h-2 absolute left-0 top-0 -translate-y-1/2 cursor-ns-resize"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      ></div>
    </div>
  </div>
</template>
<script setup>
import sendInput from './sendinput/index.vue'
import messages from './messages/index.vue'
import { ref, onMounted, computed, onUnmounted, toRaw, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../../stores/user'
import api from '../../../api'
const showMulSelect = ref(false)
provide('showMulSelect', showMulSelect)
const sendInputRef = ref(null)
const st = useUserStore()
const send_height = ref(Number(localStorage.getItem('send_height')) || 300)
const route = useRoute()
const messagesList = ref([])
const send_message = (payload) => {
  console.log('Sending message payload:', payload)
  // messagesList.value.push(payload)
  st.current_conv_msgs.push(payload)
  window.electron.ipcRenderer
    .invoke('db-operation', 'upsert-messages', { messages: [payload] })
    .then((res) => {
      console.log('Message upserted:', res)
      // st.get_current_conv_msgs({
      //   conversationType: Number(route.query.conversationType),
      //   target: route.params.target,
      //   line: 0,
      //   limit: 100
      // })
    })
}

let startY = 0
let startHeight = 0
let isResizing = false
const MIN_HEIGHT = 150
const MAX_HEIGHT = 500
const onMouseDown = (event) => {
  isResizing = true
  startY = event.clientY
  startHeight = send_height.value
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
const onMouseMove = (event) => {
  if (!isResizing) return
  const dy = event.clientY - startY
  let newHeight = startHeight - dy
  if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT
  if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT
  send_height.value = newHeight
}
const onMouseUp = () => {
  isResizing = false
  localStorage.setItem('send_height', send_height.value)
  console.log('Saved send_height:', send_height.value)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
const onlineStatus = ref({ overallStatus: -1 })
const getOnlineStatus = () => {
  if (route.query.conversationType !== '0') return
  api.user.getUserOnlineStatus(route.params.target).then((res) => {
    onlineStatus.value = res.result
  })
}
const handleEditMsg = (msg) => {
  console.log('Editing message in conversation.vue:', msg)
  sendInputRef.value.editMsg(msg)
}
const handleQuoteMsg = (msg) => {
  sendInputRef.value.quoteMsg(msg)
}
onMounted(() => {
  st.get_current_conv_msgs({
    conversationType: Number(route.query.conversationType),
    target: route.params.target,
    line: 0,
    limit: 100
  })
  st.current_conv = route.query
  getOnlineStatus()
})
onUnmounted(() => {
  st.current_conv = {}
})
</script>

<style scoped></style>
