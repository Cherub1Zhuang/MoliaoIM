<template>
  <div class="flex items-center gap-2">
    <Icon
      name="voice"
      size="24"
      color="#666"
      :class="['focus:outline-none']"
      @click="startRecord"
    />
    <Icon v-if="is_recording" name="cancel_voice" color="#666" size="26" @click="cancelRecord" />
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BenzAMRRecorder from 'benz-amr-recorder'

const emits = defineEmits(['record-finished'])

const is_recording = ref(false)
let amr = null
const init = () => {
  amr = new BenzAMRRecorder()
  amr.initWithRecord()
  amr.onStartRecord(function () {
    console.log('开始录音')
    is_recording.value = true
  })

  amr.onFinishRecord(function () {
    is_recording.value = false
    const blob = amr.getBlob()
    const duration = amr.getDuration()
    console.log('录音时长', duration)
    const file = new File([blob], 'voice.amr', { type: 'audio/amr' })
    emits('record-finished', file, duration)
    console.log('结束录音', file)
  })
}

const startRecord = () => {
  if (is_recording.value) amr.finishRecord()
  else {
    if (amr) amr.destroy()
    amr = null
    init()
    amr.startRecord()
  }
}
const cancelRecord = () => {
  amr.cancelRecord()
  amr.destroy()
  amr = null
  is_recording.value = false
}
onMounted(() => {
  init()
})
onUnmounted(() => {
  amr.destroy()
  amr = null
})
</script>

<style scoped></style>
