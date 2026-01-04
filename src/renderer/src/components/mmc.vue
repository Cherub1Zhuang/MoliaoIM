<template>
  <div class="flex items-center gap-3 fixed top-2 right-2 no-drag">
    <div class="hover:bg-stone-300 p-1 ">
      <Icon name="minimize" size="14" @click="operateWindow('minimize')" />
    </div>
    <div class="hover:bg-stone-300 p-1 ">
      <Icon v-if="is_maximized" name="maximize_1" size="14" @click="operateWindow('maximize')" />
      <Icon v-else name="maximize" size="14" @click="operateWindow('maximize')" />
    </div>
    <div class="hover:bg-stone-300 p-1 ">
      <Icon name="close" size="14" @click="operateWindow('close')" />
    </div>
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
