<template>
  <a-modal
    v-model:open="props.visible"
    title="添加好友"
    :confirm-loading="confirmLoading"
    cancelText="取消"
    okText="发送请求"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div>
      <a-input v-model:value="reason" placeholder="发送添加朋友申请" />
    </div>
  </a-modal>
</template>
<script setup>
import { ref } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import api from '@renderer/api'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:visible'])
const st = useUserStore()
const confirmLoading = ref(false)
const reason = ref(`你好，我是`)
const handleOk = () => {
  confirmLoading.value = true
  api.user
    .sendAddFriendRequest({
      targetId: props.userId,
      reason: reason.value,
      force: false
    })
    .then((res) => {
      confirmLoading.value = false
      emit('update:visible', false)
    })
}
const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped></style>
