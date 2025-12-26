<template>
  <div class="flex items-center gap-3 fixed top-2 right-2 no-drag">
    <Icon name="minimize" size="24" @click="operateWindow('minimize')" />
    <Icon v-if="is_maximized" name="maximize_1" size="24" @click="operateWindow('maximize')" />
    <Icon v-else name="maximize" size="24" @click="operateWindow('maximize')" />
    <Icon name="close" size="24" @click="operateWindow('close')" />
  </div>
</template>
<script setup>
import { ref } from 'vue'
const is_maximized = ref(false)
const operateWindow = (action) => {
  if (action === 'maximize') {
    is_maximized.value = !is_maximized.value
  }
  window.electron.ipcRenderer.send('operate-window', action)
}
</script>

<style scoped></style>
