<template>
  <a-modal v-model:open="open">
    <template #footer></template>
    <div class="p-4">
      <a-input-search
        v-model:value="search_text"
        placeholder="搜索"
        enter-button
        @search="onSearch"
      />
      <div class="border my-2" @click="list_type = 1">创建新的聊天框</div>
      <div class="h-[300px] overflow-auto" v-if="list_type === 0">
        <div
          v-for="(item, index) in st.sort_conversations"
          :key="index"
          class="flex items-center gap-3 w-full h-[60px] hover:bg-gray-100"
        >
          <avatar :url="item.conversationType === 0 ? item.receiverPortrait : item.groupPortrait" />
          <div class="text-[14px] truncate w-full min-w-0 flex-1">
            {{ item.conversationType === 0 ? item.receiverAlias : item.groupAlias }}
          </div>
        </div>
      </div>
      <div class="h-[300px] overflow-auto" v-if="list_type === 1">
        <div
          v-for="(item, index) in st.sort_groups"
          :key="item.target_id"
          class="h-[60px] px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-4"
        >
          <img :src="item.portrait" alt="" class="rounded-full w-10 h-10" />
          <span>{{
            item.type === 0 ? item.displayName : item.type === 3 ? item.displayName : item.name
          }}</span>
        </div>
        <div
          v-for="(item, index) in st.sort_friends"
          :key="item.userId"
          class="h-[60px] px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-4"
        >
          <img :src="item.portrait" alt="" class="rounded-full w-10 h-10" />
          <span>{{
            item.type === 0 ? item.displayName : item.type === 3 ? item.displayName : item.name
          }}</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import avatar from '../avatar.vue'
const st = useUserStore()
const props = defineProps({
  payload: {
    type: Object,
    default: () => ({})
  }
})
const open = defineModel('open')
const search_text = ref('')
const list_type = ref(0) //0对话框 1联系人
onMounted(() => {})
</script>

<style scoped></style>
