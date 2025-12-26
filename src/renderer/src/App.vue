<template>
  <router-view class="w-screen h-screen" />
</template>
<script setup>
import { ref, onMounted, provide } from 'vue'
const device_id = ref('')
const getDeviceId = () => {
  window.electron.ipcRenderer.invoke('get-machine-id').then((id) => {
    device_id.value = id
  })
}
onMounted(() => {
  getDeviceId()
  window.electron.ipcRenderer.on('mqtt', (event, data) => {
    console.log('Received MQTT data in App.vue:', data)
  })
})
provide('device_id', device_id)
</script>
