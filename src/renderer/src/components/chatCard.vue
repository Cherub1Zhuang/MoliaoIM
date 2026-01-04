<template>
  <div
    class="w-full h-[60px] hover:bg-gray-100 flex items-center gap-4 px-2"
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
          {{ formatWeChatTime(data.lastMessageTime) }}
        </div>
      </div>
      <div class="text-[12px] text-[#666666] truncate w-full min-w-0 h-[18px]">
        {{ data.lastMessageContent }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { formatWeChatTime } from '../utils'
import api from '../api'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import avatar from './avatar.vue'
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
</script>

<style scoped></style>
