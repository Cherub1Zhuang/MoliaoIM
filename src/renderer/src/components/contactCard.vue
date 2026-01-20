<template>
  <a-popover :trigger="isNewFriend ? 'hover' : 'none'">
    <template #content> <button @click="addFriend">【添加好友】</button> </template>
    <div
      class="h-[60px] px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-4"
      @click="chose_friend"
    >
      <img :src="data.portrait" alt="" class="rounded-full w-10 h-10" />
      <span>{{
        data.type === 0 ? data.displayName : data.type === 3 ? data.displayName : data.name
      }}</span>
    </div>
  </a-popover>
  <requestAddFriendDialog v-model:visible="visible" :userId="props.data.userId" class="no-drag" />
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import requestAddFriendDialog from '@renderer/components/dialogs/requestaddfriend.vue'
import api from '../api'
const st = useUserStore()
const router = useRouter()

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const isNewFriend = computed(() => {
  if (props.data.type !== 0) {
    return false
  }
  return st.friends.findIndex((f) => f.userId === props.data.userId) === -1
})
const chose_friend = () => {
  if (isNewFriend.value) {
    return
  }
  router.push({
    name: 'friend-info',
    params: {
      id: props.data.type === 0 ? props.data.userId : props.data.target_id
    },
    query: props.data
  })
}
const addFriend = (e) => {
  visible.value = true
}
const visible = ref(false)
</script>

<style scoped></style>
