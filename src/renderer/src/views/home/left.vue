<template>
  <div class="w-15 bg-[#f3f4f6] flex flex-col items-center justify-between py-6 drag">
    <div class="flex flex-col items-center gap-5 no-drag">
      <img :src="st.userinfo.portrait" alt="" class="w-10" />
      <!-- <Icon
        name="chat"
        size="40"
        :color="currentPath === '/chats' ? 'green' : 'gray'"
        @click="$router.push('/chats')"
      /> -->
      <div class="relative">
        <div
          v-if="st.total_unread_count > 0"
          class="absolute -top-1 -right-1 text-white flex items-center justify-center w-4 h-4 rounded-full bg-red-400"
          :class="st.total_unread_count > 99 ? 'text-[7px]' : 'text-[10px]'"
        >
          {{ st.total_unread_count }}
        </div>
        <Icon
          name="chat"
          size="30"
          @click="$router.push('/chats')"
          :fill="
            currentPath === '/chats' || currentPath.includes('/conversation') ? '#07c160' : 'none'
          "
          :stroke="
            currentPath === '/chats' || currentPath.includes('/conversation') ? 'none' : 'gray'
          "
          stroke-width="50"
        />
      </div>
      <Icon
        name="friends"
        size="30"
        :fill="currentPath === '/friends' || route.name === 'friend-info' ? '#07c160' : 'none'"
        :stroke="currentPath === '/friends' || route.name === 'friend-info' ? 'none' : 'gray'"
        @click="$router.push('/friends')"
        stroke-width="50"
      />
    </div>
    <setting />
  </div>
</template>
<script setup>
import setting from './setting.vue'
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
