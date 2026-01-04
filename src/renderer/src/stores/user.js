import { defineStore } from 'pinia'
import { ref, toRaw, computed } from 'vue'
import router from '../router'
import api from '../api'
import { pinyin } from 'pinyin-pro'

const getFisrtLetter = (name) => {
  if (!name) return '#'

  const py = pinyin(name, { pattern: 'first', toneType: 'none' })
  const letter = py.charAt(0).toUpperCase()

  return letter >= 'A' && letter <= 'Z' ? letter : '#'
}
const buildConvKey = (conv) => {
  return `${conv.target}_${conv.type}_${conv.line ?? 0}`
}

const mergeConversations = (localList = [], remoteList = []) => {
  const map = new Map()

  // 1️⃣ 本地优先：先放本地
  localList.forEach((conv) => {
    map.set(buildConvKey(conv), conv)
  })

  // 2️⃣ 用远程补全
  remoteList.forEach((conv) => {
    const key = buildConvKey(conv)
    if (!map.has(key)) {
      map.set(key, conv)
    }
  })

  return Array.from(map.values())
}

export const useUserStore = defineStore('user', () => {
  const is_login = ref(false)
  const userinfo = ref({})
  const im_token = ref({})
  const conversations = ref([])
  const sort_conversations = computed(() => {
    return conversations.value
  })
  const current_conv_msgs = ref([])
  const get_current_conv_msgs = (data) => {
    window.electron.ipcRenderer
      .invoke('db-operation', 'get-messages-by-conversation', data)
      .then((res) => {
        current_conv_msgs.value = res
        // 标记为已读
      })
    conversations.value.find(
      (item) =>
        item.conversationType === data.conversationType &&
        item.target === data.target &&
        item.line === data.line
    ).unreadCount = 0
    window.electron.ipcRenderer.send('db-operation', 'mark-conversation-as-read', {
      conversationType: data.conversationType,
      target: data.target,
      line: data.line
    })
  }
  const friends = ref([])
  const sort_friends = computed(() => {
    const map = {}
    friends.value.forEach((item) => {
      const letter = getFisrtLetter(item.displayName)
      if (!map[letter]) {
        map[letter] = []
      }
      map[letter].push(item)
    })
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.displayName.localeCompare(b.displayName, 'zh-Hans-CN'))
    })
    return Object.keys(map)
      .sort((a, b) => {
        if (a === '#') return 1
        if (b === '#') return -1
        return a.localeCompare(b)
      })
      .map((letter) => ({
        letter,
        list: map[letter]
      }))
  })
  const groups = ref([])
  const sort_groups = computed(() => {
    return groups.value.slice().sort((a, b) => {
      return pinyin(a.name).localeCompare(pinyin(b.name))
    })
  })
  const get_im_token = () => {
    api.im
      .get_im_token({
        userId: userinfo.value.userId,
        platform: 3
      })
      .then((res) => {
        im_token.value = res.result
        start_mqtt()
      })
  }
  const start_mqtt = () => {
    window.electron.ipcRenderer.send('connect-mqtt', toRaw(im_token.value))
  }
  const get_conversation_list = async () => {
    const db_conversations = await window.electron.ipcRenderer.invoke(
      'db-operation',
      'get-conversations'
    )
    conversations.value = db_conversations
    console.log('local db conversations', db_conversations)
    api.msg
      .get_conversation_list({
        userId: userinfo.value.userId,
        conversationType: 2
      })
      .then((res) => {
        console.log('conversation list', res)
        // TODO: merge local db conversations
        const mergedConversations = mergeConversations(db_conversations, res.result.conversations)
        console.log('merged conversations', mergedConversations)
        api.msg.conversation_with_more_info(mergedConversations).then(async (res2) => {
          console.log('conversation with more info', res2)
          await Promise.all(
            res2.result.map((conv) => {
              const last_msg =
                conv.outputPullMessageResultList.messages.length > 0
                  ? conv.outputPullMessageResultList.messages[
                      conv.outputPullMessageResultList.messages.length - 1
                    ]
                  : null
              conversations.value.push({
                ...conv.outputConversationItem,
                lastMessageContent: last_msg ? last_msg.payload.searchableContent : '',
                lastMessageId: last_msg ? last_msg.messageId : 0,
                lastMessageSender: last_msg ? last_msg.sender : '',
                lastMessageTime: last_msg ? last_msg.timestamp : 0,
                isTop: conv.outputConversationItem.isTop || 0,
                unreadCount: conv.outputConversationItem.unreadCount || 0
              })
              // TODO:msg 入库
              const msgs = conv.outputPullMessageResultList.messages.map((msg) => ({
                ...msg,
                conv: {
                  ...msg.conv,
                  target: conv.outputConversationItem.target
                },
                payload: {
                  ...msg.payload,
                  content: msg.payload.searchableContent
                }
              }))
              window.electron.ipcRenderer.invoke('db-operation', 'upsert-messages', {
                messages: toRaw(msgs)
              })
            })
          )
          // conversations入库
          console.log('conversations to db', conversations.value)
          window.electron.ipcRenderer.invoke('db-operation', 'upsert-conversations', {
            conversations: toRaw(conversations.value)
          })
        })
      })
  }
  const get_friend_list = () => {
    api.contact.getfriendlist().then((res) => {
      console.log('friend list', res)
      friends.value = res.result.users
    })
  }
  const get_group_list = () => {
    api.contact.getGroupList().then((res) => {
      console.log('group list', res)
      groups.value = res.result.groups
    })
  }
  const login = (data) => {
    window.electron.ipcRenderer.send('init-db', data.userId)
    is_login.value = true
    userinfo.value = data
    localStorage.setItem('token', data.token)
    get_conversation_list()
    get_friend_list()
    get_group_list()
    get_im_token()
    router.push('/')
  }
  return {
    is_login,
    userinfo,
    im_token,
    friends,
    groups,
    sort_groups,
    conversations,
    sort_conversations,
    sort_friends,
    login,
    get_im_token,
    start_mqtt,
    get_conversation_list,
    get_friend_list,
    current_conv_msgs,
    get_current_conv_msgs
  }
})
