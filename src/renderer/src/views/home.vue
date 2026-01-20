<template>
  <div class="flex w-screen h-screen">
    <left />
    <RouterView class="h-full flex-1"></RouterView>
    <Teleport to="body">
      <div class="fixed bottom-0 right-2 pointer-events-none text-[8px] text-gray-400 opacity-60">
        Client ID: {{ st.im_token.clientId || '' }}
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, onMounted, toRaw } from 'vue'
import left from './home/left.vue'
import { useUserStore } from '../stores/user'
import api from '../api'
import { useRoute } from 'vue-router'

const st = useUserStore()
const route = useRoute()

const handleMqttMsg = (data) => {
  console.log('Received MQTT message:', data)
  if (data.topic === 'MN') pullMsg()
  if (data.topic === 'FN' || data.topic === 'FRN') {
    st.get_friend_requests()
    pullMsg()
  }
}
const pullMsg = () => {
  api.msg
    .pull_msg({
      userId: st.userinfo.userId,
      exceptClientId: st.im_token.clientId,
      fromMessageId: 0,
      pullType: 0
    })
    .then(async (res) => {
      console.log('Pulled messages:', res.result.messages)

      // const msgs = res.result.messages
      const msgs = res.result.messages.map((msg) => {
        const conv_type = msg.conv.type
        if (conv_type === 0) {
          msg.conv.target = msg.sender === st.userinfo.userId ? msg.conv.target : msg.sender
          msg.payload.content =
            msg.payload.content !== '' ? msg.payload.content : msg.payload.searchableContent
        }

        if (
          msg.conv.target === route.params.target &&
          conv_type === Number(route.query.conversationType) &&
          msg.conv.line === Number(route.query.line || 0)
        ) {
          console.log('更新当前会话消息列表', msg)
          st.update_current_conv_msgs([msg])
          msg.isRead = true
        }
        return msg
      })
      const hasNewConv = msgs.some((msg) => {
        return !st.conversations.find(
          (c) =>
            c.conversationType === msg.conv.type &&
            c.target === msg.conv.target &&
            c.line === msg.conv.line
        )
      })

      // 消息入库
      window.electron.ipcRenderer
        .invoke('db-operation', 'upsert-messages', {
          messages: msgs
        })
        .then(async (res) => {
          if (hasNewConv) {
            console.log('New conversation detected, refreshing conversation list')
            st.get_conversation_list()
          } else {
            await window.electron.ipcRenderer
              .invoke('db-operation', 'get-conversations')
              .then((final_convs) => {
                st.conversations = final_convs
              })
          }
        })
    })
}

onMounted(() => {
  window.electron.ipcRenderer.on('mqtt-message', (event, data) => {
    handleMqttMsg(data)
  })
})
</script>

<style scoped></style>
