<template>
  <div class="relative w-[120px] h-[120px]" @click="open = true">
    <!-- <img :src="props.data.remotePath" class="w-full h-full object-cover" alt="" />
    <teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-500 p-20 no-drag"
        @click.self.stop="open = false"
      >
        <img
          :src="props.data.remotePath"
          class="max-w-full max-h-full"
          alt=""
          :style="{
            width: props.data.width + 'px',
            height: props.data.height + 'px'
          }"
        />
      </div>
    </teleport> -->
    <a-image :width="120" :height="120" :src="imageUrl" class="pointer-events-auto" />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
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
const imageUrl = computed(() => {
  return cacheUrl.value || remotePath.value
})
const getCacheUrl = async () => {
  let exists = false
  if (localPath.value) {
    exists = await window.electron.ipcRenderer.invoke('check-local-file-exists', localPath.value)
  }
  if (exists) {
    cacheUrl.value = 'file://' + localPath.value
  } else {
    const url = await window.electron.ipcRenderer.invoke('get-cache-url', remotePath.value)
    cacheUrl.value = url
  }
}
</script>

<style scoped></style>
