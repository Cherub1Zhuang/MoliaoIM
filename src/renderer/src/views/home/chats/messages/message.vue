<template>
  <div :class="[is_myself ? 'justify-end pl-[10%]' : 'pr-[10%]', 'w-full flex gap-2 items-start']">
    <avatar v-if="!is_myself" :url="getAvatarUrl(props.message.sender)" />
    <span
      :class="[
        is_myself ? 'bg-green-400' : 'bg-white',
        'px-2 py-1 rounded-md whitespace-normal break-all'
      ]"
    >
      {{ props.message.payload.content }}
    </span>
    <avatar v-if="is_myself" :url="getAvatarUrl(props.message.sender)" />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../../../stores/user'
import { getAvatarUrl } from '../../../../utils'
import avatar from '../../../../components/avatar.vue'
const st = useUserStore()
const is_myself = computed(() => {
  return props.message.sender === st.userinfo.userId
})
const props = defineProps({
  message: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped></style>
