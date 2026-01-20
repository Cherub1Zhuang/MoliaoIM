<template>
  <div class="relative w-[120px] h-[120px]" @click="open = true">
    <img :src="props.data.remoteCoverPath" class="w-full h-full object-cover" alt="" />
    <div class="absolute inset-0 flex items-center justify-center bg-black/30">
      <Icon name="play" color="#e6e6e6" size="24" />
    </div>
    <teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-20 no-drag"
        @click.self.stop="open = false"
      >
        <video
          class="pointer-events-auto"
          :style="{
            // width: props.data.width + 'px',
            // height: props.data.height + 'px',
            maxWidth: '100%',
            maxHeight: '100%'
          }"
          :src="props.data.remotePath"
          controls
          autoplay
          muted
          playsinline
        />
      </div>
    </teleport>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})
const open = ref(false)
</script>

<style scoped></style>
