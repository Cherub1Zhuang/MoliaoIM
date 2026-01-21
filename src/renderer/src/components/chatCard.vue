<template>
  <a-dropdown :trigger="['contextmenu']">
    <div
      class="w-full h-[60px] hover:bg-gray-100 flex items-center gap-4 px-2"
      :class="[
        props.data.target === st.current_conv.target
          ? 'bg-gray-300'
          : props.data.isTop
            ? 'bg-gray-200'
            : ''
      ]"
      @click="chose_conversation"
    >
      <div class="relative">
        <avatar :url="data.conversationType === 0 ? data.receiverPortrait : data.groupPortrait" />
        <div
          v-if="props.data.unreadCount > 0"
          class="absolute -top-1 -right-1 text-white text-[12px] flex items-center justify-center w-4 h-4 rounded-full bg-red-400"
        >
          {{ props.data.unreadCount }}
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between gap-1 items-center h-[21px]">
          <div class="text-[14px] truncate w-full min-w-0 flex-1">
            {{ data.conversationType === 0 ? data.receiverAlias : data.groupAlias }}
          </div>
          <div class="text-[#666666] text-[12px]">
            {{ formatWeChatTime(data.lastMessage?.timestamp) }}
          </div>
        </div>
        <div class="text-[12px] text-[#666666] truncate w-full min-w-0 h-[18px]">
          {{ lastMsgContent }}
        </div>
      </div>
    </div>
    <template #overlay>
      <a-menu @click="handleContextMenu">
        <a-menu-item key="1">{{ props.data.isTop ? '取消置顶' : '置顶' }}</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { formatWeChatTime } from '../utils'
import api from '../api'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import avatar from './avatar.vue'
import { MessageTypes } from '@renderer/constant'
import { getUserInfo } from '@renderer/utils'
const router = useRouter()
const st = useUserStore()
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const chose_conversation = () => {
  router.push({
    name: 'chats-conversation',
    params: {
      target: props.data.target
    },
    query: props.data
  })
}
const handleContextMenu = (data) => {
  console.log('context menu data:', data)
  if (data.key === '1') {
    window.electron.ipcRenderer
      .invoke('db-operation', 'set-conversation-top', {
        conversationType: props.data.conversationType,
        target: props.data.target,
        line: props.data.line,
        isTop: props.data.isTop ? 0 : 1
      })
      .then(() => {
        const index = st.conversations.findIndex(
          (c) =>
            c.conversationType === props.data.conversationType && c.target === props.data.target
        )
        if (index !== -1) {
          st.conversations[index].isTop = props.data.isTop ? 0 : 1
        }
      })
  }
}
const jsonData = computed(() => {
  try {
    return JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(props.data.lastMessage.payload.base64edData), (c) => c.charCodeAt(0))
      )
    )
  } catch (e) {
    return { ms: [], o: null, n: '' }
  }
})
const operatorName = computed(() => {
  const o = jsonData.value?.o
  return o ? getUserInfo(o)?.data?.displayName : ''
})

const memberNames = computed(() => {
  return (jsonData.value?.ms || [])
    .map((userId) => getUserInfo(userId)?.data?.displayName)
    .filter(Boolean)
    .join(', ')
})
const lastMsgContent = computed(() => {
  switch (props.data.lastMessage?.payload?.type || null) {
    case MessageTypes.TEXT:
      return props.data.lastMessage.payload.content
    case MessageTypes.IMAGE:
      return '[图片]'
    case MessageTypes.Voice:
      return '[语音]'
    case MessageTypes.FILE:
      return '[文件]'
    case MessageTypes.HELLO:
      return '以上是打招呼内容'
    case MessageTypes.YOUAREFRIENDS:
      return '你们已经是好友了，可以开始聊天了'
    case MessageTypes.Name_Card:
      return '[名片]'
    case MessageTypes.Multiple:
      return '[图片]'
    case MessageTypes.Composited:
      return '[聊天记录]' + props.data.lastMessage.payload.content
    case MessageTypes.REMOVEFROMGROUP:
      return operatorName.value
        ? `${operatorName.value}把${memberNames.value}移除了群组`
        : '[群成员变动]'

    case MessageTypes.INVITETOGROUP:
      return operatorName.value
        ? `${operatorName.value}邀请${memberNames.value}加入了群聊`
        : '[群成员变动]'
    case MessageTypes.CREATEGROUP:
      return `${operatorName.value}创建了群组${jsonData.value.n}`
    case MessageTypes.Recall:
      return `${
        props.data.lastMessage.sender === st.userinfo.userId
          ? '你'
          : getUserInfo(props.data.lastMessage.sender).data?.displayName
      }撤回了一条消息`
    case MessageTypes.Change_Group_Mute:
      return `${
        props.data.lastMessage.sender === st.userinfo.userId
          ? '你'
          : getUserInfo(props.data.lastMessage.sender).data?.displayName
      }${jsonData.value.n === '1' ? '开启全员禁言' : '关闭全员禁言'}`
    case MessageTypes.Set_Group_Manager:
      return `${
        props.data.lastMessage.sender === st.userinfo.userId
          ? '你'
          : getUserInfo(props.data.lastMessage.sender).data?.displayName
      }把${memberNames.value}设为了管理员`
    case null:
      return ''
    default:
      return '[未知消息类型]'
  }
})
</script>

<style scoped></style>
