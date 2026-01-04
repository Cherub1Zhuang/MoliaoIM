import moment from 'moment'
import i18n from './i18n'
import api from './api'
import { reactive } from 'vue'

export const formatWeChatTime = (timestamp) => {
  if (!timestamp) return ''
  const ts = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp

  moment.locale(i18n.global.locale.value)

  const time = moment(ts)
  const now = moment()

  if (time.isSame(now, 'day')) {
    return time.format('HH:mm')
  }

  if (time.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return i18n.global.t('time.yesterday')
  }

  if (time.isSame(now, 'week')) {
    return time.format(i18n.global.locale.value.startsWith('zh') ? 'dddd' : 'ddd')
  }

  if (time.isSame(now, 'year')) {
    return time.format(i18n.global.locale.value.startsWith('zh') ? 'M月D日' : 'MMM D')
  }

  return time.format(i18n.global.locale.value.startsWith('zh') ? 'YYYY/MM/DD' : 'MMM D, YYYY')
}
const userInfoCache = reactive({})
import DEFAULT_AVATAR from './assets/default_avatar.png'
export const getAvatarUrl = (userId) => {
  const cached = userInfoCache[userId]

  // 已有头像 → 直接返回（响应式）
  if (cached?.data?.portrait) {
    return cached.data.portrait
  }

  // 未加载或失败 → 触发请求
  if (!cached?.loading) {
    fetchUserInfo(userId)
  }

  // 立刻返回占位图
  return DEFAULT_AVATAR
}
export const fetchUserInfo = async (userId) => {
  const cached = userInfoCache[userId]
  if (cached?.loading) return

  userInfoCache[userId] = { loading: true }

  try {
    const res = await api.user.getUserInfo(userId)
    if (res.code === 0) {
      userInfoCache[userId] = {
        data: res.result,
        loading: false
      }
    } else {
      delete userInfoCache[userId]
    }
  } catch {
    delete userInfoCache[userId]
  }
}
