<template>
  <div class="text-[gray] no-drag">
    <a-popover
      placement="rightTop"
      trigger="hover"
      :overlayInnerStyle="{
        padding: '0',
        radius: '4px',
        overflow: 'hidden'
      }"
    >
      <template #content>
        <!-- <a-menu>
          <a-menu-item>退出登录</a-menu-item>
          <a-menu-item>检查更新</a-menu-item>
        </a-menu> -->
        <div class="flex items-center flex-col p-2">
          <button class="py-1 px-2 hover:bg-gray-100 rounded-md" @click="st.logout">
            退出登录
          </button>
          <button class="py-1 px-2 hover:bg-gray-100 rounded-md">检查更新</button>
        </div>
      </template>
      <Icon name="setting" size="30" color="currentColor" class="outline-none" />
    </a-popover>
  </div>
</template>
<script setup>
import { useUserStore } from '../../stores/user'
const st = useUserStore()
</script>

<style scoped></style>
