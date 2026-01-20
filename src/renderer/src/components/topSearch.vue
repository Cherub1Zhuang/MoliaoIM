<template>
  <div
    id="searchContainer"
    ref="containerRef"
    class="relative h-16 border-b border-gray-200 flex justify-between items-center gap-4 px-3 drag"
  >
    <div class="flex-1 flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md no-drag min-w-0">
      <Icon name="search" size="20" class="shrink-0" />
      <input
        v-if="inputModel === 'search'"
        ref="searchInputRef"
        type="text"
        :placeholder="t('search')"
        class="outline-none flex-1"
        @focus="handleSearchInputFocus"
      />
      <input
        v-if="inputModel === 'addfriend'"
        v-model="add_input_val"
        @keydown.enter="searchUser"
        ref="addInputRef"
        type="text"
        :placeholder="['添加朋友']"
        class="outline-none flex-1"
      />
    </div>
    <div
      v-if="inputModel === 'search'"
      class="flex items-center bg-gray-100 p-1 rounded-md no-drag"
      title="添加朋友"
      @click="handleAddFriendBtnClick"
    >
      <Icon name="addfriend" size="20" class="" />
    </div>
    <div
      v-if="inputModel === 'addfriend'"
      class="text-gray-500 cursor-pointer no-drag"
      @click="((inputModel = 'search'), (searchResultVisible = false))"
    >
      [取消]
    </div>
    <div
      ref="searchResultRef"
      v-if="searchResultVisible"
      class="w-full absolute left-0 top-16 h-[calc(100vh-65px)] bg-gray-100 z-10"
    >
      <div v-if="inputModel === 'addfriend'">
        <contactCard v-for="user in user_search_result" :key="user.userId" :data="user" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../api'
import contactCard from './contactCard.vue'
const { t } = useI18n()
const inputModel = ref('search')
const searchResultVisible = ref(false)
const searchInputRef = ref(null)
const searchResultRef = ref(null)
const add_input_val = ref('')
const user_search_result = ref([])
const containerRef = ref(null)
const handleDocumentClick = (e) => {
  const target = e.target
  // 1️⃣ 搜索容器
  if (containerRef.value?.contains(target)) return
  // 2️⃣ Ant Popover
  if (target.closest('.ant-popover')) return
  // 3️⃣ Ant Modal
  if (target.closest('.ant-modal')) return
  // ❌ 真正的 outside
  searchResultVisible.value = false
  inputModel.value = 'search'
  document.removeEventListener('click', handleDocumentClick)
}
const handleSearchInputFocus = () => {
  searchResultVisible.value = true
  document.addEventListener('click', handleDocumentClick)
}
const handleAddFriendBtnClick = (e) => {
  e.stopPropagation()
  inputModel.value = 'addfriend'
  searchResultVisible.value = true
  document.addEventListener('click', handleDocumentClick)
}
const searchUser = () => {
  console.log('search user:', add_input_val.value)
  api.user
    .searchUser({
      count: 20,
      offset: 0,
      name: '',
      displayName: '',
      mobile: add_input_val.value,
      email: '',
      type: 0,
      types: [0, 1, 2]
    })
    .then((res) => {
      console.log('search result:', res)
      user_search_result.value = res.result.userInfoList || []
    })
}
</script>

<style scoped></style>
