<template>
  <div class="w-full h-full flex flex-col">
    <div class="h-10"></div>
    <div
      ref="inputRef"
      class="flex-1 w-full outline-none p-3 overflow-y-auto whitespace-normal break-all"
      contenteditable
    ></div>
    <div class="py-3 px-15 flex items-center justify-end">
      <button class="h-8 w-25 border rounded-md" @click="send">{{ t('send_btn') }}</button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@renderer/api'
import { useUserStore } from '@renderer/stores/user'
const st = useUserStore()
const { t } = useI18n()
const props = defineProps({
  target: {
    type: String,
    default: ''
  },
  type: {
    type: Number,
    default: 0
  }
})
const emit = defineEmits(['send-message'])
const updateSendMsg = (content, messageId, timestamp) => {
  const payload = {
    messageId: messageId,
    sender: st.userinfo.userId,
    conv: {
      type: props.type,
      target: props.target,
      line: 0
    },
    payload: {
      type: props.type,
      searchableContent: content,
      pushContent: '',
      pushData: '',
      content: content,
      mediaType: 0,
      remoteMediaUrl: '',
      persistFlag: 0,
      expireDuration: 0,
      mentionedType: 0,
      mentionedTarget: [],
      extra: ''
    },
    toUsers: [],
    timestamp: timestamp
  }
  emit('send-message', payload)
}
const inputRef = ref(null)
const getContent = () => {
  return inputRef.value.innerText
}

const send = () => {
  const content = getContent()
  api.msg
    .send_msg({
      type: props.type,
      target: props.target.split('|')[0],
      // target: props.target.split('|')[0],
      line: 0,
      messagePayload: {
        type: 0,
        searchableContent: content,
        pushContent: '',
        pushData: '',
        content: content,
        base64edData: '',
        mediaType: 0,
        remoteMediaUrl: '',
        persistFlag: 0,
        expireDuration: 0,
        mentionedType: 0,
        mentionedTarget: [],
        extra: ''
      }
    })
    .then((res) => {
      console.log(res)
      inputRef.value.innerText = ''
      updateSendMsg(content, res.result.messageUid, res.result.timestamp)
    })
}
</script>

<style scoped></style>
