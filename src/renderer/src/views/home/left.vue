<template>
  <div class="w-80 divide-y divide-gray-300 flex flex-col border-r border-gray-300 h-full">
    <div class="w-full h-20 flex items-center gap-4 px-4 drag">
      <Icon name="hamberg" size="32" class="no-drag" />
      <div class="flex-1 min-w-0 no-drag bg-stone-100 rounded-md px-2 py-1 flex items-center gap-2">
        <Icon name="search" size="24" class="shrink-0" />
        <input type="text" class="flex-1 min-w-0 outline-none" placeholder="搜索" />
      </div>
      <Icon name="addfriend" size="32" class="no-drag" />
    </div>
    <div class="w-full h-20 flex items-center justify-around">
      <div class="flex flex-col items-center justiy-center" @click="activeTab = 'chat'">
        <Icon name="chat" size="40" :color="activeTab === 'chat' ? 'pink' : ''" />
        <span class="text-[#666666]">{{ t('home.chat') }}</span>
      </div>
      <div class="flex flex-col items-center justiy-center" @click="activeTab = 'contacts'">
        <Icon name="contacts" size="40" :color="activeTab === 'contacts' ? 'pink' : ''" />
        <span class="text-[#666666]">{{ t('home.contacts') }}</span>
      </div>
      <div class="flex flex-col items-center justiy-center" @click="activeTab = 'group'">
        <Icon name="friends" size="40" :color="activeTab === 'group' ? 'pink' : ''" />
        <span class="text-[#666666]">{{ t('home.group') }}</span>
      </div>
    </div>
    <div class="w-full flex-1 min-h-0">
      <chats v-if="activeTab === 'chat'" />
      <!-- Additional tabs can be added here -->
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import chats from './chats.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const activeTab = ref('chat')
</script>

<style scoped></style>
