<template>
  <div class="flex w-screen h-screen">
    <left />
    <RouterView class="h-full flex-1"></RouterView>
    <mmc />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import left from './home/left.vue'
import mmc from '../components/mmc.vue'
import { useUserStore } from '../stores/user'
import api from '../api'

const st = useUserStore()

const test = async () => {
  const res = await api.im.get_im_token({ userId: st.userinfo.userId, platform: 3 })
  console.log('IM Token:', res)
  window.electron.ipcRenderer.send('connect-mqtt', res.result)
}
onMounted(() => {
  test()
})
</script>

<style scoped></style>
