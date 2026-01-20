import axios from 'axios'
const NO_TOKEN_URLS = [
  '/login_pwd'
  // '/contact/friends'
]

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API_URL || '/api',
  timeout: 1000000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})
instance.interceptors.request.use(
  (config) => {
    // 添加 token 或其他 header
    const needToken = !NO_TOKEN_URLS.some((url) => config.url?.includes(url))
    const token = localStorage.getItem('token')
    if (token && needToken) {
      config.headers.Authorization = token.trim()
    }
    return config
  },
  (error) => Promise.reject(error)
)

instance.interceptors.response.use(
  (response) => response.data, // 只返回 data
  (error) => {
    // 统一错误提示
    console.error('API error:', error)
    return Promise.reject(error)
  }
)
export default instance
