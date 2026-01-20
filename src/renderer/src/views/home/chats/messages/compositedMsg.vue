<template>
  <div
    :class="[
      props.self ? 'bg-green-400' : 'bg-white',
      'px-2 py-1 rounded-md whitespace-normal break-all'
    ]"
    @click="open = true"
  >
    <div>{{ props.data.payload.content }}</div>
    <div class="text-gray-400">
      <div v-for="m in ms.slice(0, 3)" :key="m.messageId">
        {{ getUserInfo(m.sender).data?.displayName }}:{{ calcShowText(m) }}
      </div>
      <div v-if="ms.length > 3">...</div>
    </div>
    <div class="border-t border-gray-200 text-gray-400 text-[14px]">聊天记录</div>
  </div>
  <a-modal v-model:open="open" @ok="open = false" :title="props.data.payload.content">
    <div class="w-full pt-5">
      <div v-for="m in ms" :key="m.messageId" class="flex item-start w-full gap-2">
        <div>
          <img :src="getAvatarUrl(m.sender)" class="w-10 h-10 rounded-full object-cover" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between text-gray-400">
            <div>{{ getUserInfo(m.sender).data?.displayName }}</div>
            <div>{{ formatWeChatTime(m.timestamp) }}</div>
          </div>
          <div>
            <div v-if="m.payload.type === MessageTypes.TEXT">
              {{ m.payload.content || m.payload.searchableContent }}
            </div>
            <div v-else-if="m.payload.type === MessageTypes.FILE">
              <fileMsg :data="m" />
            </div>
            <div v-else-if="m.payload.type === MessageTypes.Multiple">
              <multipleMsg :data="m" />
            </div>
            <div v-else-if="m.payload.type === MessageTypes.Composited">
              <SelfNode :data="m" />
            </div>
            <div v-else-if="m.payload.type === MessageTypes.Name_Card">
              <namecardMsg :data="m" />
            </div>
            <div v-else>{{ m.payload.type }}</div>
          </div>
        </div>
      </div>
    </div>
    <template #footer> </template>
  </a-modal>
</template>
<script setup>
import { ref, computed } from 'vue'
import { getUserInfo } from '@renderer/utils'
import { MessageTypes } from '@renderer/constant'
import { getAvatarUrl, formatWeChatTime } from '@renderer/utils'
import fileMsg from './fileMsg.vue'
import multipleMsg from './multipleMsg.vue'
import namecardMsg from './namecardMsg.vue'
defineOptions({ name: 'SelfNode' })
const open = ref(false)
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  self: {
    type: Boolean,
    default: false
  }
})
const ms = computed(
  () =>
    jsonData.value.ms.map((m) => ({
      messageId: m.uid,
      sender: m.from,
      conv: { type: m.type, target: m.target, line: m.line },
      payload: {
        type: m.ctype,
        content: m.cc,
        searchableContent: m.csc,
        remoteMediaUrl: m.mru || '',
        base64edData: m.cbc || ''
      },
      timestamp: m.serverTime
    })) || []
)
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
const calcShowText = (m) => {
  switch (m.payload.type) {
    case MessageTypes.TEXT:
      return m.payload.searchableContent
    case MessageTypes.Voice:
      return '[语音]'
    case MessageTypes.FILE:
      return '[文件]'
    case MessageTypes.IMAGE:
      return '[图片]'
    case MessageTypes.Name_Card:
      return '[名片]'
    case MessageTypes.Multiple:
      return '[图片]'
    case MessageTypes.Composited:
      return '[聊天记录]' + m.payload.content
    default:
      return '[未知消息类型]'
  }
}
</script>

<style scoped></style>
