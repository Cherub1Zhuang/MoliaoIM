<template>
  <div class="py-1 rounded-md bg-gray-200 flex items-center max-w-full pr-2" @click="download">
    <div class="">
      <!-- <Icon v-if="props.data.payload.mediaType===4" name="file" width="64"/> -->
      <Icon name="file" width="48" height="64" />
    </div>
    <div>{{ props.data.payload.searchableContent }}</div>
    <!-- <div>{{ props.data.payload.remoteMediaUrl }}</div> -->
  </div>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const download = () => {
  const url = props.data.payload.remoteMediaUrl
  window.electron.ipcRenderer.send('download-file', {
    url,
    fileName: props.data.payload.searchableContent
  })
}
</script>

<style scoped></style>
