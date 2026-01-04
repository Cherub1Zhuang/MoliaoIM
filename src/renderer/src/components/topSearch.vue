<template>
  <div class="h-16 border-b border-gray-200 flex justify-between items-center gap-4 px-3 drag">
    <div class="flex-1 flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md no-drag min-w-0">
      <Icon name="search" size="20" class="shrink-0" />
      <input type="text" :placeholder="t('search')" class="outline-none flex-1" />
    </div>
    <div class="flex items-center bg-gray-100 p-1 rounded-md no-drag">
      <Icon name="addfriend" size="20" class="" />
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped></style>
