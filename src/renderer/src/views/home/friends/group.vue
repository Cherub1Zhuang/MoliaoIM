<template>
  <div class="flex flex-col items-center gap-2 pt-[25%]">
    <img :src="data.portrait" alt="" class="rounded-md w-24 h-24 object-cover" />
    <div class="flex items-center gap-10 text-xl text-[#666]">
      {{ props.data.name }}
    </div>
    <button class="bg-[#07c160] text-white rounded-md px-2 py-1" @click="startChat">
      进入群聊
    </button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const startChat = () => {
  router.push({
    name: 'chats-conversation',
    params: { target: props.data.target_id },
    query: {
      conversationType: 1,
      groupAlias: props.data.name
    }
  })
}
</script>

<style scoped></style>
