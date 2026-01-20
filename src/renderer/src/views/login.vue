<template>
  <div
    class="relative flex flex-col items-center justify-center w-screen h-screen bg-[url('https://i.pinimg.com/1200x/a6/11/9e/a6119e4ef5594227d591e6fdbf44e7b0.jpg')] bg-cover"
  >
    <div class="absolute left-4 top-4 flex items-center gap-2">
      <img src="@renderer/assets/logo.jpg" alt="" class="w-10 rounded-md" />
      <span class="text-xl text-[#999999]">云语</span>
    </div>
    <div class="flex flex-col items-center gap-3 w-80 p-5 rounded-md shadow-md no-drag bg-white/30">
      <div class="text-xl font-bold">{{ t('login.welcome_back') }}</div>
      <div class="text-[#999999]">{{ t('login.please_login') }}</div>
      <a-input v-model:value="mobile" :placeholder="t('login.mobile_placeholder')"></a-input>
      <a-input
        type="password"
        v-model:value="password"
        :placeholder="t('login.password_placeholder')"
      ></a-input>
      <a-button type="primary" @click="login">{{ t('login.login_button') }}</a-button>
    </div>
  </div>
</template>
<script setup>
import api from '../api'
import { ref, inject, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
const { t } = useI18n()

const st = useUserStore()
// 13641009424
const mobile = ref('13641009425')
const password = ref('111111')
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
      } else {
        toast.error('登录错误！')
      }
    })
}
onMounted(() => {
  // login()
})
</script>

<style scoped></style>
