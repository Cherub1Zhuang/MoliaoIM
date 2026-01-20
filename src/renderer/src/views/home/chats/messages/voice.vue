<template>
  <div
    :class="[
      is_myself ? 'bg-green-400 justify-end' : 'bg-white',
      'px-2 py-1 rounded-md  w-20 h-8 flex items-center gap-2 cursor-pointer'
    ]"
    @click="play"
  >
    <voiceWave v-if="!is_myself" :animated="state === 'playing'" direction="right" />
    <span>{{ time }}"</span>
    <voiceWave v-if="is_myself" :animated="state === 'playing'" direction="left" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../../../../stores/user'
import BenzAMRRecorder from 'benz-amr-recorder'
import voiceWave from '../../../../components/voiceWave.vue'
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const st = useUserStore()
// const is_myself = ref(true)
const is_myself = computed(() => {
  return props.data.sender === st.userinfo.userId
})
const url = computed(() => {
  return props.data.payload.remoteMediaUrl
})
const time = computed(() => {
  return JSON.parse(props.data.payload.content).duration
})
const state = ref('init') // init, playing, paused
let amrRec = new BenzAMRRecorder()
const init = () => {
  amrRec.initWithUrl(url.value).then(function () {})
  amrRec.onPlay(function () {
    state.value = 'playing'
  })
  amrRec.onStop(function () {
    state.value = 'paused'
  })
  amrRec.onResume(function () {
    state.value = 'playing'
  })
  amrRec.onAutoEnded(function () {
    state.value = 'init'
  })
}
const play = () => {
  console.log('当前状态', state.value)
  switch (state.value) {
    case 'init':
      amrRec.play()
      break
    case 'playing':
      amrRec.pause()
      break
    case 'paused':
      amrRec.resume()
      break
  }
}
onMounted(() => {
  init()
})
onUnmounted(() => {
  amrRec.stop()
  // 消毁实例
  amrRec = null
})
</script>
<style scoped></style>
