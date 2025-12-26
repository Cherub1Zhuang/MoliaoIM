<template>
  <div class="w-full h-full min-h-0">
    <!-- <chatCard /> -->
    <RecycleScroller
      class="h-full scrollbar-hide"
      :items="st.sessions"
      :item-size="60"
      key-field="id"
      v-slot="{ item }"
    >
      <chatCard :data="item" />
    </RecycleScroller>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import chatCard from '../../components/chatCard.vue'
import { useSession } from '../../stores/session'

const st = useSession()
</script>

<style scoped></style>
