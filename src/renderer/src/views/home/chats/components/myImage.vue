<template>
  <div class="relative w-[120px] h-[120px]" @click="open = true">
    <!-- <img :src="props.data.remotePath" class="w-full h-full object-cover" alt="" />
    <teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-500 p-20 no-drag"
        @click.self.stop="open = false"
      >
        <img
          :src="props.data.remotePath"
          class="max-w-full max-h-full"
          alt=""
          :style="{
            width: props.data.width + 'px',
            height: props.data.height + 'px'
          }"
        />
      </div>
    </teleport> -->
    <a-image :width="120" :height="120" :src="props.data.remotePath" class="pointer-events-auto" />
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
