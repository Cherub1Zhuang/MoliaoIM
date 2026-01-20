import moment from 'moment'
import imageCompression from 'browser-image-compression'
import i18n from './i18n'
import api from './api'
import { reactive } from 'vue'
const zhWeekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
export const formatWeChatTime = (timestamp) => {
  if (!timestamp) return ''
  const ts = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp

  moment.locale('zh-cn')
  // moment.locale(i18n.global.locale.value)

  const time = moment(ts)
  const now = moment()

  if (time.isSame(now, 'day')) {
    return time.format('HH:mm')
  }

  if (time.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return i18n.global.t('time.yesterday')
  }

  if (time.isSame(now, 'week')) {
    return zhWeekMap[time.day()]
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
export const getUserInfo = (userId) => {
  if (!userId) return null

  let cached = userInfoCache[userId]

  // 还没有任何缓存 → 初始化 & 触发请求
  if (!cached) {
    cached = userInfoCache[userId] = {
      loading: false,
      data: null,
      error: false
    }
    fetchUserInfo(userId)
  }
  // 已存在缓存
  return cached
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

export const compressForIM = async (file) => {
  const sizeKB = file.size / 1024

  // 默认值
  let quality = 0.85
  let maxWidthOrHeight = 1920

  if (sizeKB < 100) {
    return file // 不压缩
  } else if (sizeKB < 500) {
    quality = 0.85
    maxWidthOrHeight = 1920
  } else if (sizeKB < 1024) {
    quality = 0.8
    maxWidthOrHeight = 1920
  } else if (sizeKB < 5 * 1024) {
    quality = 0.75
    maxWidthOrHeight = 1920
  } else {
    quality = 0.7
    maxWidthOrHeight = 1600
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 5, // 兜底，不让它太离谱
    maxWidthOrHeight,
    initialQuality: quality,
    useWebWorker: true
  })

  return compressed
}
