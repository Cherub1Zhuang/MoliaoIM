<template>
  <div class="flex flex-col w-full h-full min-h-0">
    <div class="h-16 border-b border-gray-200 flex items-center px-3 drag">
      {{ route.query.receiverAlias }}
    </div>
    <div class="flex-1 min-h-0">
      <messages class="w-full h-full" :key="route.fullPath" :messages="messagesList" />
    </div>
    <div
      class="w-full relative border-t border-gray-200"
      :style="{
        height: send_height + 'px'
      }"
    >
      <sendInput
        class="w-full h-full"
        :key="route.fullPath"
        :target="route.params.target"
        :type="route.params.type"
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../../stores/user'

const st = useUserStore()
const send_height = ref(Number(localStorage.getItem('send_height')) || 300)
const route = useRoute()
const messagesList = ref([])
const send_message = (payload) => {
  console.log('Sending message payload:', payload)
  // messagesList.value.push(payload)
  window.electron.ipcRenderer.invoke('db-operation', 'upsert-message', { message: payload }).then(() => {
    st.get_current_conv_msgs({
      conversationType: Number(route.query.conversationType),
      target: route.params.target,
      line: 0,
      limit: 100
    })
  })
}

let startY = 0
let startHeight = 0
let isResizing = false
const MIN_HEIGHT = 100
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

onMounted(() => {
  // window.electron.ipcRenderer
  //   .invoke('db-operation', 'get-messages-by-conversation', {
  //     conversationType: Number(route.query.conversationType),
  //     target: route.params.target,
  //     line: 0,
  //     limit: 100
  //   })
  //   .then((res) => {
  //     messagesList.value = res
  //   })
  st.get_current_conv_msgs({
    conversationType: Number(route.query.conversationType),
    target: route.params.target,
    line: 0,
    limit: 100
  })
})
</script>

<style scoped></style>
