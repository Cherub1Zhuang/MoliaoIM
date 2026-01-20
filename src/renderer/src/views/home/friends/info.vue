<template>
  <div>
    <personal v-if="route.query.type === '0'" :data="route.query" />
    <group v-else-if="route.query.type === '2'" :data="route.query" />
    <personal v-else-if="route.query.type === '3'" :data="route.query" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import group from './group.vue'
import personal from './personal.vue'
const route = useRoute()
onMounted(() => {
  console.log('Friend info route query:', route.query, route.params)
})
</script>

<style scoped></style>
