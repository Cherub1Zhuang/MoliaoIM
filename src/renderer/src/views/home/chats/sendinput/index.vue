<template>
  <div v-if="!showMulSelect" class="w-full h-full flex flex-col relative">
    <div
      v-if="is_editing"
      class="absolute w-full left-0 top-0 -translate-y-[100%] flex items-center justify-between bg-[#ffd0e9] px-2"
    >
      {{ edit_msg.payload.content }}
      <div>
        <Icon name="close" size="16" @click="handleCloseEdit" />
      </div>
    </div>
    <div
      v-if="is_quoting"
      class="absolute w-full left-0 top-0 -translate-y-[100%] flex items-center justify-between bg-gray-200 px-2"
    >
      {{ quote_msg.payload.searchableContent }}
      <div>
        <Icon name="close" size="16" @click="handleCloseQuote" class="" />
      </div>
    </div>
    <div class="h-10 flex items-center gap-2 px-3">
      <emojis @select-emoji="handleSelectEmoji" />
      <files
        @upload-complete="handleUploadComplete"
        :class="is_editing || is_quoting ? 'dim' : ''"
      />
      <!-- <voice @record-finished="handleVoiceRecordFinished" /> -->
    </div>
    <div class="w-full flex items-center gap-2 flex-wrap overflow-auto max-h-[120px]">
      <div v-for="(item, index) in draft.imgs" :key="index" class="w-[120px] relative group">
        <Icon
          name="delete"
          class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-500 rounded-full"
          @click="delmediafromdraft(item.id)"
          color="gray"
          size="16"
        />
        <div
          v-if="item.status === 'uploading'"
          class="flex items-center justify-center w-30 h-30 relative"
        >
          <!-- <a-progress type="circle" :percent="item.percent" :size="80" /> -->
          <img :src="item.tmpUrl" class="w-full h-full object-cover opacity-50" alt="" />
          <div class="absolute inset-0 flex items-center justify-center">
            <a-spin />
          </div>
        </div>
        <myImage v-else-if="item.type === MessageMediaType.IMAGE" :data="item" />
        <myVideo v-else-if="item.type === MessageMediaType.VIDEO" :data="item" />
      </div>
    </div>
    <div
      ref="inputRef"
      class="flex-1 w-full outline-none p-3 overflow-y-auto whitespace-normal break-all min-h-0"
      contenteditable
      @keydown="onKeydown"
    ></div>
    <div class="py-3 px-15 flex items-center justify-end">
      <button class="h-8 w-25 bg-stone-200 text-stone-500 rounded-md relative" @click="send">
        <div
          v-if="show_send_error"
          class="absolute top-0 left-[50%] -translate-x-[50%] -translate-y-[120%] w-40 bg-white rounded-md p-1"
        >
          {{ send_error_text }}
        </div>
        {{ t('send_btn') }}
      </button>
    </div>
  </div>
  <div v-else class="w-full h-full relative">
    <div class="flex items-center justify-end p-5">
      <Icon name="close" size="20" @click="showMulSelect = false" />
    </div>
    <div class="flex-1 flex items-center justify-center gap-15">
      <div class="flex flex-col items-center gap-2">
        <Icon name="share" size="40" />
        转发
      </div>
      <div class="flex flex-col items-center gap-2">
        <Icon name="delete" size="40" />
        删除
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, toRaw, inject, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@renderer/api'
import { useUserStore } from '@renderer/stores/user'
import emojis from './emojis.vue'
import files from './files.vue'
import { MessageMediaType, MessageTypes } from '@renderer/constant'
import myVideo from '../components/myVideo.vue'
import myImage from '../components/myImage.vue'
import * as fu from './utils'
import { nanoid } from 'nanoid'
import { compressForIM } from '@renderer/utils'
import { getUserInfo } from '@renderer/utils'

const showMulSelect = inject('showMulSelect')

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

const onKeydown = (e) => {
  // ✅ Enter 发送（阻止默认换行）
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault()
    send()
    return
  }

  // ✅ Shift + Enter：允许换行（默认行为即可）
  if (e.key === 'Enter' && e.shiftKey) {
    // 不阻止默认行为
    // 让它自然换行
    return
  }
}

const updateSendMsg = (payload, messageId, timestamp) => {
  payload.messageId = messageId
  payload.timestamp = timestamp
  payload.sender = st.userinfo.userId
  payload.conv = {
    type: props.type,
    target: props.target,
    line: 0
  }
  payload.payload = payload.messagePayload
  emit('send-message', payload)
}
const inputRef = ref(null)
const draft = ref({
  imgs: [],
  voices: [],
  files: [],
  videos: [],
  meta: {}
})
const getContent = () => {
  return inputRef.value.innerText
}

const canSend = (content) => {
  if (draft.value.imgs.find((item) => item.status !== 'done')) {
    send_error_text.value = '图片或视频正在上传'
    show_send_error.value = true
    return false
  }
  if (content) return true
  if (draft.value.imgs.length > 0) return true
  if (draft.value.files.length > 0) return true
  if (draft.value.voices.length > 0) return true
  if (draft.value.videos.length > 0) return true
  send_error_text.value = '不能发送空白消息'
  show_send_error.value = true
  return false
}
const send_error_text = ref('')
const show_send_error = ref(false)
watch(show_send_error, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      show_send_error.value = false
    }, 2000)
  }
})
const calculateType = () => {
  if (draft.value.imgs.length > 0 || draft.value.videos.length > 0) return MessageTypes.Multiple
  return MessageTypes.TEXT
}
const send = () => {
  const content = getContent()
  if (!canSend(content)) return
  if (is_editing.value) {
    sendEditedMsg(content)
    return
  }
  if (is_quoting.value) {
    send_quote_msg(content)
    return
  }
  const type = calculateType()
  const payload_content =
    type === MessageTypes.TEXT
      ? content
      : JSON.stringify({
          caption: content, //文字
          media: [...toRaw(draft.value.imgs), ...toRaw(draft.value.videos)]
        })
  const payload = {
    type: props.type,
    target: props.target.split('|')[0],
    line: 0,
    messagePayload: {
      type: type,
      // searchableContent: payload_content,
      searchableContent: type === MessageTypes.TEXT ? content : '[图片]',
      pushContent: '',
      pushData: '',
      content: payload_content,
      base64edData: '',
      mediaType: type === MessageTypes.TEXT ? 0 : MessageMediaType.IMAGE,
      remoteMediaUrl: '',
      persistFlag: 3,
      expireDuration: 0,
      mentionedType: 0,
      mentionedTarget: [],
      extra: ''
    }
  }
  inputRef.value.innerText = ''
  api.msg
    .send_msg(payload)
    .then((res) => {
      console.log(res)
      if (res.code === 0) updateSendMsg(payload, res.result.messageUid, res.result.timestamp)
    })
    .finally(() => {
      draft.value = {
        imgs: [],
        voices: [],
        files: [],
        videos: [],
        meta: {}
      }
    })
}
const handleSelectEmoji = (emoji) => {
  inputRef.value.innerText += emoji
}
const getMediaType = (file) => {
  const type = file.type
  if (type.startsWith('image/')) return MessageMediaType.IMAGE
  else if (type.startsWith('video/')) return MessageMediaType.VIDEO
  // else if (type.startsWith('audio/')) return MessageMediaType.VOICE
  else return MessageMediaType.FILE
}

const handleUploadComplete = async (files) => {
  files.map(async (f) => {
    const mediaType = getMediaType(f)
    const localPath = window.api.getRealPath(f)
    console.log('本地文件路径:', localPath)
    let placeholder = {
      type: mediaType,
      percent: 0,
      status: 'uploading',
      localPath: localPath || '',
      id: nanoid()
    }

    if (mediaType === MessageMediaType.IMAGE || mediaType === MessageMediaType.VIDEO) {
      if (draft.value.imgs.length >= 9) return
    }
    if (mediaType === MessageMediaType.IMAGE) placeholder.tmpUrl = URL.createObjectURL(f)
    if (mediaType === MessageMediaType.VIDEO) {
      const original_cover = await fu.getVideoCoverFile(f)
      const cover = await compressForIM(original_cover)
      const coverRes = await api.upload.upload_file_v2(cover)
      placeholder.remoteCoverPath = coverRes.code === 0 ? coverRes.result : null
      const size = await fu.getImageSize(cover)
      placeholder.width = size.width
      placeholder.height = size.height
      placeholder.tmpUrl = URL.createObjectURL(cover)
    }
    if (mediaType === MessageMediaType.IMAGE || mediaType === MessageMediaType.VIDEO)
      draft.value.imgs.push(placeholder)

    const res = await api.upload.upload_file_v2(f)

    if (res.code === 0) {
      if (mediaType === MessageMediaType.FILE) {
        sendfile(res.result, f.name, f.size)
        return
      }
      const tmp = { remotePath: res.result }

      if (mediaType === MessageMediaType.IMAGE) {
        const size = await fu.getImageSize(f)
        tmp.width = size.width
        tmp.height = size.height
      }

      if (mediaType === MessageMediaType.IMAGE || mediaType === MessageMediaType.VIDEO) {
        const idx = draft.value.imgs.findIndex((item) => item.id === placeholder.id)
        if (idx !== -1)
          draft.value.imgs[idx] = { ...draft.value.imgs[idx], ...tmp, status: 'done', percent: 100 }
      } else if (mediaType === MessageMediaType.VOICE) {
        draft.value.voices.push(tmp)
      } else {
        draft.value.files.push(tmp)
      }
    } else {
      const idx = draft.value.imgs.findIndex((item) => item.id === placeholder.id)
      if (idx !== -1) {
        draft.value.imgs[idx].status = 'failed'
        draft.value.imgs[idx].percent = 0
      }
    }
    URL.revokeObjectURL(placeholder.tmpUrl)
  })
}
const delmediafromdraft = (id) => {
  draft.value.imgs = draft.value.imgs.filter((item) => item.id !== id)
}
const edit_msg = ref({})
const is_editing = ref(false)
const editMsg = (msg) => {
  is_quoting.value = false
  quote_msg.value = {}
  edit_msg.value = msg
  inputRef.value.innerText = msg.payload.content
  is_editing.value = true
}
const handleCloseEdit = () => {
  is_editing.value = false
  edit_msg.value = {}
}
const sendEditedMsg = (content) => {
  const payload = {
    operator: st.userinfo.userId,
    messageUid: edit_msg.value.messageId,
    payload: {
      type: MessageTypes.TEXT,
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
    },
    distribute: 1,
    updateTimestamp: 0,
    meshLocal: 0
  }
  inputRef.value.innerText = ''
  const idx = st.current_conv_msgs.findIndex((item) => item.messageId === edit_msg.value.messageId)
  st.current_conv_msgs[idx].payload.content = content
  is_editing.value = false
  window.electron.ipcRenderer
    .invoke('db-operation', 'upsert-messages', {
      messages: [toRaw(st.current_conv_msgs[idx])]
    })
    .then((res) => {
      console.log('本地消息内容更新结果:', res)
    })
  edit_msg.value = {}
  api.msg.update_msg(payload).then((res) => {
    console.log('编辑消息响应:', res)
  })
}
const sendfile = (url, name, size) => {
  const payload = {
    type: props.type,
    target: props.target,
    line: 0,
    fileUrl: url,
    fileName: name,
    fileSize: size
  }
  api.msg.send_file_msg(payload).then((res) => {
    console.log('Send file message response:', res)
    // messageUid: '532101174636085249'
    // timestamp: 1768461611990
    st.get_conversation_list()
  })
}
const handleVoiceRecordFinished = async (file, duration) => {
  const res = await api.upload.upload_file_v2(file)
  if (res.code === 0) {
    const payload = {
      type: props.type,
      target: props.target,
      line: 0,
      toUsers: [],
      voiceUrl: res.result,
      duration: duration
    }
    api.msg.send_voice_msg(payload).then((res) => {
      console.log('Send voice message response:', res)
      st.get_conversation_list()
    })
  }
}
const quote_msg = ref({})
const is_quoting = ref(false)
const quoteMsg = (msg) => {
  edit_msg.value = {}
  is_editing.value = false
  quote_msg.value = msg
  is_quoting.value = true
}
const handleCloseQuote = () => {
  is_quoting.value = false
  quote_msg.value = {}
}
const send_quote_msg = async (content) => {
  const payload = {
    type: props.type,
    target: props.target,
    line: 0,
    quotedMessageUid: quote_msg.value.messageId,
    content: content
  }
  inputRef.value.innerText = ''
  is_quoting.value = false

  await api.msg.send_quote_msg(payload).then((res) => {
    if (res.code === 0) {
      const p_msg = {
        sender: st.userinfo.userId,
        conv: { type: props.type, target: props.target, line: 0 },
        payload: {
          type: 1,
          searchableContent: content,
          pushContent: '',
          pushData: '',
          content: content,
          base64edData: btoa(
            String.fromCharCode(
              ...new TextEncoder().encode(
                JSON.stringify({
                  quote: {
                    d: quote_msg.value.payload.content,
                    u: quote_msg.value.messageId,
                    i: quote_msg.value.sender,
                    n: getUserInfo(quote_msg.value.sender).data?.displayName || ''
                  }
                })
              )
            )
          ),
          mediaType: 0,
          remoteMediaUrl: '',
          persistFlag: 3,
          expireDuration: 0,
          mentionedType: 0,
          mentionedTarget: [],
          extra: ''
        },
        toUsers: [],
        timestamp: res.result.timestamp,
        messageId: res.result.messageUid,
        isRead: true
      }
      st.update_current_conv_msgs([p_msg])
      const idx = st.conversations.findIndex(
        (c) => c.conversationType === props.type && c.target === props.target && c.line === 0
      )
      if (idx !== -1) {
        st.conversations[idx].lastMessage = p_msg
      }
      window.electron.ipcRenderer
        .invoke('db-operation', 'upsert-messages', {
          messages: [p_msg]
        })
        .then((res) => {})
    }
  })
  quote_msg.value = {}
}
defineExpose({
  editMsg,
  quoteMsg
})
</script>

<style scoped></style>
