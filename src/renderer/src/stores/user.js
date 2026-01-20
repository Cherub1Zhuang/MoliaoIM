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

  // 1️⃣ 先放本地（作为主数据源）
  localList.forEach((local) => {
    if (!local) return
    map.set(buildConvKey(local), { ...local })
  })

  // 2️⃣ 用远程数据合并
  remoteList.forEach((remote) => {
    if (!remote) return

    const key = buildConvKey(remote)

    if (map.has(key)) {
      const local = map.get(key)

      // 🔥 核心合并规则
      map.set(key, {
        ...local, // 本地字段优先
        lastMessageId: local.lastMessage?.messageId ?? 0,
        receiverPortrait: remote.receiverPortrait ?? local.receiverPortrait ?? null,
        receiverAlias: remote.receiverAlias ?? local.receiverAlias ?? null,
        // ✅ 新增
        groupPortrait: remote.groupPortrait ?? local.groupPortrait ?? null,
        groupAlias: remote.groupAlias ?? local.groupAlias ?? null
      })
    } else {
      // 本地没有 → 直接用远程
      map.set(key, { ...remote })
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
    return [...conversations.value].sort((a, b) => {
      // 1️⃣ isTop 优先
      if ((b.isTop || 0) !== (a.isTop || 0)) {
        return (b.isTop || 0) - (a.isTop || 0)
      }

      // 2️⃣ lastMessageTime 倒序
      const timeA = a.lastMessage?.timestamp || 0
      const timeB = b.lastMessage?.timestamp || 0
      return timeB - timeA
    })
  })
  const total_unread_count = computed(() => {
    return conversations.value.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  })

  const current_conv = ref({})
  const current_conv_msgs = ref([])
  const sort_current_conv_msgs = computed(() => {
    return [...current_conv_msgs.value].sort((a, b) => a.timestamp - b.timestamp)
  })
  const update_current_conv_msgs = (msgs) => {
    msgs.forEach((msg) => {
      const exists = current_conv_msgs.value.find((m) => m.messageId === msg.messageId)
      if (!exists) {
        current_conv_msgs.value.push(msg)
        api.msg
          .batch_mark_read({
            userId: userinfo.value.userId,
            messageUids: [msg.messageId],
            messageWebUids: [msg.messageId]
          })
          .then((res) => {
            console.log('标记已读成功', res)
          })
      } else {
        Object.assign(exists, msg)
      }
    })
  }
  const get_current_conv_msgs = (data) => {
    if (!data.target) return
    window.electron.ipcRenderer
      .invoke('db-operation', 'get-messages-by-conversation', data)
      .then((res) => {
        console.log('当前会话消息', res)
        current_conv_msgs.value = res.messages
        // 标记为已读

        const c = conversations.value.find(
          (item) =>
            item.conversationType === Number(data.conversationType) &&
            item.target === data.target &&
            item.line === Number(data.line)
        )
        const lm = res.messages.length > 0 ? res.messages[res.messages.length - 1] : null
        c.unreadCount = 0
        if (lm) {
          c.lastMessage = lm
        }
        if (res.markedReadIds.length > 0) {
          api.msg
            .batch_mark_read({
              userId: userinfo.value.userId,
              messageUids: res.markedReadIds,
              messageWebUids: res.markedReadIds
            })
            .then((res) => {
              console.log('标记已读成功', res)
            })
        }
      })

    // window.electron.ipcRenderer.send('db-operation', 'mark-conversation-as-read', {
    //   conversationType: data.conversationType,
    //   target: data.target,
    //   line: data.line
    // })
  }
  const update_conversation = (conv) => {
    window.electron.ipcRenderer.invoke('db-operation', 'get-conversation', conv).then((res) => {
      // TODO: 更新 conversations 和 current_conv_msgs
      const index = conversations.value.findIndex(
        (item) =>
          item.conversationType === conv.conversationType &&
          item.target === conv.target &&
          item.line === conv.line
      )
      if (index !== -1) {
        conversations.value[index] = res
      } else {
        conversations.value.push(res)
      }
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
    api.msg
      .get_conversation_list({
        userId: userinfo.value.userId,
        conversationType: 2 // 0: 单聊，1：群聊，2：全部
      })
      .then((res) => {
        const mergedConversations = mergeConversations(db_conversations, res.result.conversations)
        api.msg.conversation_with_more_info(mergedConversations).then(async (res2) => {
          await Promise.all(
            res2.result.map((conv) => {
              if (!conv.outputPullMessageResultList) {
                return Promise.resolve()
              }
              const msgs = conv.outputPullMessageResultList.messages.map((msg) => ({
                ...msg,
                conv: {
                  ...msg.conv,
                  target: conv.outputConversationItem.target
                },
                payload: {
                  ...msg.payload,
                  content:
                    msg.payload.content !== '' ? msg.payload.content : msg.payload.searchableContent
                }
              }))
              window.electron.ipcRenderer.invoke('db-operation', 'upsert-messages', {
                messages: toRaw(msgs)
              })
            })
          )

          window.electron.ipcRenderer
            .invoke('db-operation', 'upsert-conversations', {
              conversations: toRaw(mergedConversations)
            })
            .then(async () => {
              await window.electron.ipcRenderer
                .invoke('db-operation', 'get-conversations')
                .then((final_convs) => {
                  conversations.value = final_convs
                })
            })
        })
      })
  }
  const get_friend_list = () => {
    api.contact.getfriendlist().then((res) => {
      friends.value = res.result.users
    })
  }
  const get_group_list = () => {
    api.contact.getGroupList().then((res) => {
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
  const logout = () => {
    is_login.value = false
    window.electron.ipcRenderer.send('disconnect-db')
    userinfo.value = {}
    im_token.value = {}
    conversations.value = []
    current_conv.value = {}
    current_conv_msgs.value = []
    friends.value = []
    groups.value = []
    localStorage.removeItem('token')
    router.push('/login')
  }
  const upload_files = (file, handleProgress = null) => {
    return api.upload.upload_files(userinfo.value.userId, file, handleProgress)
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
    logout,
    get_im_token,
    start_mqtt,
    get_conversation_list,
    get_friend_list,
    current_conv_msgs,
    get_current_conv_msgs,
    update_conversation,
    current_conv,
    total_unread_count,
    upload_files,
    update_current_conv_msgs,
    sort_current_conv_msgs
  }
})
