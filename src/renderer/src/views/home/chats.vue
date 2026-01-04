<template>
  <div class="w-full h-full min-h-0 flex no-drag divide-x divide-gray-200">
    <VueResizable
      class="h-full"
      :max-width="500"
      :min-width="250"
      :width="center_width"
      height="auto"
      :active="['r']"
      :fitParent="true"
      @resize:move="handleResize"
    >
      <div class="h-full min-h-0 flex flex-col">
        <topSearch />
        <div class="flex-1 overflow-auto">
          <RecycleScroller
            :key="st.sort_conversations.length"
            class="h-full scrollbar-hide"
            :items="st.sort_conversations"
            :item-size="60"
            key-field="target"
            v-slot="{ item }"
          >
            <chatCard :data="item" />
          </RecycleScroller>
        </div>
      </div>
    </VueResizable>

    <router-view class="flex-1 h-full" :key="$route.fullPath"></router-view>
  </div>
</template>
<script setup>
import topSearch from '../../components/topSearch.vue'
import { ref } from 'vue'
import chatCard from '../../components/chatCard.vue'
import VueResizable from 'vue-resizable'
import { useUserStore } from '../../stores/user'
const st = useUserStore()
const center_width = ref(Number(localStorage.getItem('center_width')) || 300)
const handleResize = (data) => {
  localStorage.setItem('center_width', data.width)
}
</script>

<style scoped></style>
