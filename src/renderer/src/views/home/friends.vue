<template>
  <div class="w-full h-full min-h-0 flex no-drag divide-x divide-gray-200">
    <vue-resizable
      class="h-full"
      max-width="500"
      min-width="250"
      :width="center_width"
      height="auto"
      :active="['r']"
      :fitParent="true"
      @resize:move="handleResize"
    >
      <div class="h-full min-h-0 flex flex-col">
        <topSearch />
        <div class="flex-1 overflow-auto scrollbar-hide">
          <div class="border-b border-gray-200">
            <div class="px-3 py-1 text-xs text-gray-500">{{ t('group') }}</div>
            <contactCard v-for="group in st.groups" :key="group.target_id" :data="group" />
          </div>
          <div class="px-3 py-1 text-xs text-gray-500">{{ t('friend') }}</div>
          <div v-for="item in st.sort_friends" :key="item.letter" class="">
            <div class="px-3 py-1 text-xs text-gray-500">{{ item.letter }}</div>
            <contactCard v-for="friend in item.list" :key="friend.userId" :data="friend" />
          </div>
        </div>
      </div>
    </vue-resizable>

    <router-view class="flex-1 h-full" :key="$route.fullPath"></router-view>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import topSearch from '../../components/topSearch.vue'
import contactCard from '../../components/contactCard.vue'
import VueResizable from 'vue-resizable'
import { useUserStore } from '../../stores/user'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const st = useUserStore()
const center_width = ref(Number(localStorage.getItem('center_width')) || 300)
const handleResize = (data) => {
  localStorage.setItem('center_width', data.width)
}
</script>

<style scoped></style>
