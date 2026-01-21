<template>
  <div v-if="msgType === MessageTypes.HELLO" class="notify-msg">{{ '以上是打招呼内容' }}</div>
  <div v-else-if="msgType === MessageTypes.YOUAREFRIENDS" class="notify-msg">
    {{ '你们已经是好友了，可以开始聊天了' }}
  </div>
  <removefromgroupMsg v-else-if="msgType === MessageTypes.REMOVEFROMGROUP" :data="props.message" />
  <invitetogroupMsg v-else-if="msgType === MessageTypes.INVITETOGROUP" :data="props.message" />
  <creategroupMsg v-else-if="msgType === MessageTypes.CREATEGROUP" :data="props.message" />
  <recallMsg v-else-if="msgType === MessageTypes.Recall" :data="props.message" />
  <changegroupmuteMsg
    v-else-if="msgType === MessageTypes.Change_Group_Mute"
    :data="props.message"
  />
  <setgroupmanagerMsg
    v-else-if="msgType === MessageTypes.Set_Group_Manager"
    :data="props.message"
  />
  <div
    v-else
    :class="[is_myself ? 'justify-end pl-[10%]' : 'pr-[10%]', 'w-full flex gap-2 items-start']"
  >
    <avatar v-if="!is_myself" :url="getAvatarUrl(props.message.sender)" />
    <a-dropdown trigger="contextmenu">
      <template #overlay>
        <div class="bg-white rounded-md">
          <a-menu>
            <a-menu-item v-if="props.message.conv.type === 1" key="9" @click="">
              {{ `${extra.readUsers?.length || 0}人已读` }}
            </a-menu-item>
            <a-menu-item v-if="canRecall" key="1" @click="recallMessage">撤回</a-menu-item>
            <a-menu-item key="2" @click="$emit('forward-msg')">转发</a-menu-item>
            <a-menu-item key="3" @click="deleteMessage">删除</a-menu-item>
            <a-menu-item key="4" @click="copyMessage">复制</a-menu-item>
            <a-menu-item v-if="canEdit" key="5" @click="$emit('edit-msg')">编辑</a-menu-item>
            <a-menu-item key="7" @click="showMulSelect = true">多选</a-menu-item>
            <a-menu-item key="8" @click="$emit('quote-msg')">引用</a-menu-item>
            <!-- <a-menu-item key="6">收藏</a-menu-item>
          <a-menu-item key="8">引用</a-menu-item> -->
          </a-menu>
        </div>
      </template>
      <div class="relative" :class="is_myself ? 'text-end' : ''">
        <div v-if="msgType === MessageTypes.TEXT" :class="is_myself ? 'text-end' : ''">
          <span
            :class="[
              is_myself ? 'bg-green-400' : 'bg-white',
              'px-2 py-1 rounded-md whitespace-normal break-all'
            ]"
          >
            {{ props.message.payload.content
            }}<ifread class="" v-if="is_myself" :extra="props.message.payload.extra" />
          </span>
        </div>
        <imgMsg v-else-if="msgType === MessageTypes.IMAGE" :data="props.message.payload.content" />
        <fileMsg v-else-if="msgType === MessageTypes.FILE" :data="props.message" />
        <namecardMsg v-else-if="msgType === MessageTypes.Name_Card" :data="props.message" />
        <multipleMsg v-else-if="msgType === MessageTypes.Multiple" :data="props.message" />
        <voice v-else-if="msgType === MessageTypes.Voice" :data="props.message" />
        <compositedMsg
          v-else-if="msgType === MessageTypes.Composited"
          :data="props.message"
          :self="is_myself"
        />
        <span
          v-else
          :class="[
            is_myself ? 'bg-green-400' : 'bg-white',
            'px-2 py-1 rounded-md whitespace-normal break-all'
          ]"
        >
          {{ props.message.payload.content }}
        </span>
        <div
          v-if="jsonData.quote"
          class="mt-2 text-gray-500 bg-gray-200 rounded-md px-2 py-1 min-w-0 max-w-full whitespace-normal break-all"
        >
          {{ jsonData.quote.n }}:{{ jsonData.quote.d }}
        </div>
      </div>
    </a-dropdown>
    <avatar v-if="is_myself" :url="getAvatarUrl(props.message.sender)" />
  </div>
</template>
<script setup>
import api from '@renderer/api'
import { ref, computed, inject } from 'vue'
import { useUserStore } from '../../../../stores/user'
import { getAvatarUrl } from '../../../../utils'
import avatar from '../../../../components/avatar.vue'
import { MessageTypes } from '@renderer/constant'
import imgMsg from './imgMsg.vue'
import fileMsg from './fileMsg.vue'
import removefromgroupMsg from './removefromgroupMsg.vue'
import invitetogroupMsg from './invitetogroupMsg.vue'
import creategroupMsg from './creategroupMsg.vue'
import namecardMsg from './namecardMsg.vue'
import multipleMsg from './multipleMsg.vue'
import recallMsg from './recallMsg.vue'
import voice from './voice.vue'
import compositedMsg from './compositedMsg.vue'
import changegroupmuteMsg from './changegroupmuteMsg.vue'
import ifread from './ifread.vue'
import setgroupmanagerMsg from './setgroupmanagerMsg.vue'

const showMulSelect = inject('showMulSelect')
const st = useUserStore()
const is_myself = computed(() => {
  return props.message.sender === st.userinfo.userId
})
const props = defineProps({
  message: {
    type: Object,
    default: () => ({})
  }
})
const jsonData = computed(() => {
  try {
    return JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(props.message.payload.base64edData), (c) => c.charCodeAt(0))
      )
    )
  } catch (e) {
    return {}
  }
})
const extra = computed(() => {
  if (!props.message.payload.extra)
    return {
      read: false,
      readUsers: []
    }
  try {
    return JSON.parse(props.message.payload.extra)
  } catch (e) {
    return {
      read: false,
      readUsers: []
    }
  }
})
const msgType = computed(() => {
  return props.message.payload.type
})

const canEdit = computed(() => {
  if (!st.userinfo.userName.startsWith('kefu')) return false
  // return true
  if (props.message.sender !== st.userinfo.userId) return false
  const now = Date.now()
  const msgTime = props.message.timestamp
  return now - msgTime <= 5 * 60 * 1000 // 5分钟内可编辑
})
const canRecall = computed(() => {
  if (props.message.sender !== st.userinfo.userId) return false
  // 1768253770000
  const now = Date.now()
  const msgTime = props.message.timestamp
  return now - msgTime <= 5 * 60 * 1000 // 2分钟内可撤回
})
const recallMessage = () => {
  api.msg.recall_msg(props.message.messageId).then((res) => {
    console.log('撤回消息响应:', res)
    if (res.code === 0) {
      // st.get_conversation_list()
      recallMsgInLocal()
    }
  })
}
const recallMsgInLocal = () => {
  // 改变current_conv_msgs中的消息类型为Recall
  window.electron.ipcRenderer
    .invoke('db-operation', 'updateMessagePayloadTypeByMsgId', {
      messageId: props.message.messageId,
      type: MessageTypes.Recall
    })
    .then((res) => {
      st.get_current_conv_msgs({
        conversationType: props.message.conv.type,
        target: props.message.conv.target,
        line: props.message.conv.line
      })
    })
  // 改变数据库
}
const copyMessage = () => {
  navigator.clipboard.writeText(props.message.payload.content).then(
    () => {
      console.log('文本已复制到剪贴板')
    },
    (err) => {
      console.error('无法复制文本: ', err)
    }
  )
}
const deleteMessage = () => {
  st.current_conv_msgs = st.current_conv_msgs.filter(
    (msg) => msg.messageId !== props.message.messageId
  )
  window.electron.ipcRenderer
    .invoke('db-operation', 'delete-messages-by-ids', {
      messageIds: [props.message.messageId]
    })
    .then((res) => {
      console.log('本地删除消息结果:', res)
    })
  api.msg.delete_msg(props.message.messageId).then((res) => {
    console.log('删除消息响应:', res)
  })
}
</script>

<style scoped></style>
