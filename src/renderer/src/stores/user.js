import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'
export const useUserStore = defineStore('user', () => {
  const is_login = ref(false)
  const userinfo = ref({})
  const login = (data) => {
    // data {
    //     "userId": "ded583b6fb43480dbd3f77a14e1d5f0e",
    //     "token": "aE4wQUYyWFg2K29VSEU4UjI0VkVxekxjSUM3d3NZdE9HaUpndXcvNk51WDRZM1FzQXdYelVtb3N0RVlHeWhUOENablNYYUtGSEhVPXwwZTViZDRmMi00ZmYyLTQ3YWItOTIyMy1mYmJkNzQwYmYyNjN8NGU3YTJlMjEtYjE1MS00ZTZjLWJlNTctMWJjYmUxMTU0ZmNh",
    //     "register": false,
    //     "userName": "48TN2I7L",
    //     "portrait": "http://minio.mcbao.cn:19000/ddlj/SAM-01/2025-11-17/f352d062-1b9f-4918-b43c-7650f3260cf0.png"
    // }
    is_login.value = true
    userinfo.value = data
    localStorage.setItem('token', data.token)
    router.push('/')
  }
  return {
    is_login,
    userinfo,
    login
  }
})
