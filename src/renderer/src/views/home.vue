<template>
  <div class="flex w-screen h-screen">
    <left />
    <RouterView class="h-full flex-1"></RouterView>
  </div>
</template>
<script setup>
import { ref, onMounted, h } from 'vue'
import left from './home/left.vue'
import { useUserStore } from '../stores/user'
import api from '../api'
import { useRoute } from 'vue-router'

const st = useUserStore()
const route = useRoute()

const updateConversation = (convs) => {
  convs.forEach((c) => {
    console.log('Updating conversation:', c)
    const st_c = st.conversations.find(
      (item) =>
        item.conversationType === c.conversationType &&
        item.target === c.target &&
        (item.line || 0) === (c.line || 0)
    )
    if (st_c) {
      st_c.lastMessageId = c.lastMessageId
      st_c.lastMessageSender = c.lastMessageSender
      st_c.lastMessageContent = c.lastMessageContent
      st_c.lastMessageTime = c.lastMessageTime
      st_c.unreadCount = c.unreadCount
    }
  })
  st.get_current_conv_msgs({
    conversationType: Number(route.query.conversationType),
    target: route.params.target,
    line: 0,
    limit: 100
  })
}

const handleMqttMsg = (data) => {
  if (data.topic === 'MN') pullMsg()
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
          msg.conv.target =
            msg.sender === st.userinfo.userId
              ? msg.conv.target + '|' + msg.sender
              : msg.sender + '|' + msg.conv.target
          msg.payload.content = msg.payload.searchableContent
        }
        return msg
      })
      window.electron.ipcRenderer
        .invoke('db-operation', 'filter-messages-and-upsert', {
          messages: msgs
        })
        .then((res) => {
          updateConversation(res)
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
