<template>
  <div class="w-full h-[60px] hover:bg-gray-100 flex items-center gap-4 px-2">
    <img :src="data.avatar" class="border w-12 h-12" alt="" />
    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-center">
        <div>{{ data.name }}</div>
        <div class="text-[#666666]">{{ data.lastMessage_time }}</div>
      </div>
      <div class="text-[#666666] truncate w-full min-w-0">{{ data.lastMessage }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      avatar:
        'https://img2.baidu.com/it/u=2509569563,4144869871&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
      name: '默认用户',
      lastMessage: '这是最后一条消息的预览',
      lastMessage_time: '12:30 PM'
    })
  }
})
</script>

<style scoped></style>
