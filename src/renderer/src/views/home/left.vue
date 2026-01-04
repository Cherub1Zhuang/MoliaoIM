<template>
  <div class="w-15 bg-[#f3f4f6] flex flex-col items-center py-6 drag">
    <div class="flex flex-col items-center gap-5 no-drag">
      <img :src="st.userinfo.portrait" alt="" class="w-10" />
      <Icon
        name="chat"
        size="40"
        :color="currentPath === '/chats' ? 'green' : 'gray'"
        @click="$router.push('/chats')"
      />
      <Icon
        name="friends"
        size="40"
        :color="currentPath === '/friends' ? 'blue' : 'gray'"
        @click="$router.push('/friends')"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../../stores/user'
import { useRoute } from 'vue-router'
const st = useUserStore()
const { t } = useI18n()
const route = useRoute()
const currentPath = computed(() => route.path)
</script>

<style scoped></style>
