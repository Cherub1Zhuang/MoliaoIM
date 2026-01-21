<template>
  <a-config-provider :locale="zhCN">
    <router-view class="w-screen h-screen" />
    <mmc />
  </a-config-provider>
</template>
<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import mmc from './components/mmc.vue'

import { ref, onMounted, provide } from 'vue'
const device_id = ref('')
const getDeviceId = () => {
  window.electron.ipcRenderer.invoke('get-machine-id').then((id) => {
    device_id.value = id
  })
}

onMounted(() => {
  getDeviceId()
})
provide('device_id', device_id)
</script>
