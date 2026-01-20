<template>
  <div
    class="max-w-full"
    :class="[
      is_myself ? 'bg-green-400' : 'bg-white',
      'px-2 py-1 rounded-md whitespace-normal break-all'
    ]"
  >
    <!-- {{ content }} -->
    <div
      class="grid gap-1"
      :class="cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : 'grid-cols-3'"
    >
      <div v-for="img in imgs" :key="img" class="w-[120px] h-[120px] overflow-hidden">
        <!-- <a-image
          v-if="img.type === MessageMediaType.IMAGE"
          :src="img.remotePath"
          :preview="{
            onVisibleChange: handleonVisibleChange
          }"
          alt=""
          width="120"
          height="120"
          class="w-[120px] h-[120px] object-cover no-drag"
        /> -->
        <myImage v-if="img.type === MessageMediaType.IMAGE" :data="img" />
        <myVideo
          v-else-if="img.type === MessageMediaType.VIDEO"
          :data="img"
          class="w-[120px] h-[120px] object-cover no-drag"
        />
      </div>
    </div>
    <div class="break-all whitespace-normal">
      {{ text }}<ifread class="" v-if="is_myself" :extra="props.data.payload.extra" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import { MessageMediaType } from '@renderer/constant'
import myVideo from '../components/myVideo.vue'
import myImage from '../components/myImage.vue'
import ifread from './ifread.vue'
const st = useUserStore()
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const is_myself = computed(() => {
  return props.data.sender === st.userinfo.userId
})
const content = computed(() => {
  try {
    return JSON.parse(props.data.payload.content)
  } catch (e) {
    return {
      media: [],
      caption: ''
    }
  }
})
const imgs = computed(() => {
  return content.value.media || []
})
const cols = computed(() => {
  return imgs.value.length === 1 ? 1 : imgs.value.length === 2 ? 2 : 3
})
const text = computed(() => {
  return content.value.caption || ''
})
const handleonVisibleChange = (v) => {
  // console.log('visible change', v)
}
</script>

<style scoped></style>
