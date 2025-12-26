import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'
import api from '../api'
export const useSession = defineStore('session', () => {
  const sessions = ref(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `session-${i}`,
      lastMessage: `This is the last message of session-${i}`,
      lastMessage_time: '12:30 PM'
    }))
  ) // 会话列表
  const friends = ref([]) // 好友列表
  onMounted(() => {
    api.contact.getfriendlist().then((res) => {
      console.log('friendlist', res)
    })
  })
  return {
    sessions
  }
})
