<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :multiple="multiple"
      :accept="accept"
      @change="handleFiles"
    />
    <Icon name="folder" size="24" color="#666" class="focus:outline-none" @click="openFileDialog" />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

const props = defineProps({
  multiple: {
    type: Boolean,
    default: true
  },
  accept: {
    type: String,
    default: '' // 如 'image/*,.pdf'
  }
})
const emits = defineEmits(['upload-complete'])
const fileInput = ref(null)
const openFileDialog = () => {
  fileInput.value?.click()
}

const MAX_FILE_SIZE = Number(import.meta.env.VITE_APP_MAX_FILE_SIZE) || 20971520
const handleFiles = async (e) => {
  const files = Array.from(e.target.files)
  const okFiles = files.filter((file) => file.size <= MAX_FILE_SIZE)
  const oversizeFiles = files.filter((file) => file.size > MAX_FILE_SIZE)
  e.target.value = ''
  if (okFiles.length === 0) {
    toast('没有符合大小限制的文件可上传', { type: 'error' })
    return
  }
  if (oversizeFiles.length > 0) {
    toast(`以下文件超过大小限制，无法上传: ${oversizeFiles.map((f) => f.name).join(', ')}`, {
      type: 'error'
    })
  }
  emits('upload-complete', okFiles)
}
</script>

<style scoped></style>
