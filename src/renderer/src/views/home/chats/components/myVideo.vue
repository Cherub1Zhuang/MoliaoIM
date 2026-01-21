<template>
  <div class="relative w-[120px] h-[120px]" @click="open = true">
    <img :src="props.data.remoteCoverPath" class="w-full h-full object-cover" alt="" />
    <div class="absolute inset-0 flex items-center justify-center bg-black/30">
      <Icon name="play" color="#e6e6e6" size="24" />
    </div>
    <teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-20 no-drag"
        @click.self.stop=""
      >
        <Icon
          name="close"
          class="absolute top-4 right-4 cursor-pointer"
          color="white"
          size="34"
          @click="open = false"
        />
        <video
          class="pointer-events-auto"
          :style="{
            // width: props.data.width + 'px',
            // height: props.data.height + 'px',
            maxWidth: '100%',
            maxHeight: '100%'
          }"
          :src="videoUrl"
          controls
          autoplay
          muted
          playsinline
        />
      </div>
    </teleport>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const open = ref(false)
const remotePath = computed(() => {
  return props.data.remotePath || ''
})
const localPath = computed(() => {
  return props.data.localPath || ''
})
const cacheUrl = ref('')
const videoUrl = computed(() => {
  return cacheUrl.value || remotePath.value
})
const getCacheUrl = async () => {
  let exists = false
  if (localPath.value) {
    exists = await window.electron.ipcRenderer.invoke('check-local-file-exists', localPath.value)
  }

  if (exists) {
    cacheUrl.value = `file://${localPath.value}`
    return
  }
  window.electron.ipcRenderer
    .invoke('get-cache-url', remotePath.value)
    .then((url) => {
      console.log('cached video url:', url)
      cacheUrl.value = url
    })
    .catch((err) => {
      console.error('get cached video url error:', err)
    })
}
watch(open, (newVal) => {
  if (newVal && !cacheUrl.value) {
    getCacheUrl()
  }
})
onMounted(() => {})
</script>

<style scoped></style>
