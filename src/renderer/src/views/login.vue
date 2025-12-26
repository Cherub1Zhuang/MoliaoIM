<template>
  <div>
    <button class="w-100 h-100 border" @click="login">Login</button>
  </div>
</template>
<script setup>
import api from '../api'
import { ref, inject } from 'vue'
import { useUserStore } from '../stores/user'

const st = useUserStore()

const mobile = ref('13641009439')
const password = ref('123456')
const device_id = inject('device_id')
const login = () => {
  api.user
    .login_pwd({
      mobile: mobile.value,
      password: password.value,
      device: device_id.value,
      platform: 3,
      clientId: ''
    })
    .then((res) => {
      console.log(res)
      if (res.code === 0) {
        st.login(res.result)
      }
    })
}
</script>

<style scoped></style>
