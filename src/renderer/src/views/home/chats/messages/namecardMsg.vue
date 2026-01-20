<template>
  <div class="bg-white p-2 rounded-md divide-y divide-gray-200 min-w-[200px] max-w-[300px]">
    <!-- {{ jsonData }} -->
    <div class="flex items-center gap-2 pb-2">
      <img :src="jsonData.p" alt="" class="w-10 h-10 rounded-full" />
      <div class="flex flex-col items-start text-[12px]">
        <span>{{ jsonData.d }}</span>
        <span>{{ jsonData.n }}</span>
      </div>
    </div>
    <div class="flex items-center justify-between text-gray-400 text-[12px] pt-2">
      [个人名片]
      <button class="px-2 py-1 bg-green-400 rounded-md text-white" @click="addFriend">
        添加到通讯录
      </button>
    </div>
    <requestAddFriendDialog v-model:visible="visible" :userId="jsonData.f" />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { getUserInfo } from '@renderer/utils'
import api from '@renderer/api'
import requestAddFriendDialog from '@renderer/components/dialogs/requestaddfriend.vue'
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const jsonData = computed(() => {
  try {
    return JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(props.data.payload.base64edData), (c) => c.charCodeAt(0))
      )
    )
  } catch (e) {
    return {}
  }
})
const visible = ref(false)
const addFriend = (e) => {
  e.stopPropagation()
  visible.value = true
}
</script>

<style scoped></style>
