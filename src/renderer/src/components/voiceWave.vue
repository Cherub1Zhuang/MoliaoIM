<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="signal-icon"
    :class="[{ animate: animated }, directionClass]"
  >
    <!-- 圆点 -->
    <circle :cx="dotCx" cy="50" :r="dotSize" :fill="color" />

    <!-- 内弧 -->
    <path
      :d="innerArcPath"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      fill="none"
      class="arc arc-inner"
    />

    <!-- 外弧 -->
    <path
      :d="outerArcPath"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      fill="none"
      class="arc arc-outer"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: Number, default: 24 },
  color: { type: String, default: '#333' },
  strokeWidth: { type: Number, default: 10 },
  dotSize: { type: Number, default: 8 },
  animated: { type: Boolean, default: false },

  // ✅ 新增：方向
  // 'right'：朝右（默认）
  // 'left'：朝左
  direction: {
    type: String,
    default: 'right',
    validator: (v) => ['left', 'right'].includes(v)
  }
})

// ✅ 方向 class
const directionClass = computed(() => {
  return props.direction === 'left' ? 'dir-left' : 'dir-right'
})

// 圆点位置（朝右时圆点在左）
const dotCx = 22

const innerArcPath = computed(() => {
  return `
    M 45 32
    Q 60 50 45 68
  `
})

const outerArcPath = computed(() => {
  return `
    M 62 20
    Q 85 50 62 80
  `
})
</script>

<style scoped>
.signal-icon {
  display: inline-block;
}

/* ✅ 朝左 = 水平翻转 */
.signal-icon.dir-left {
  transform: scaleX(-1);
}

.signal-icon.dir-right {
  transform: scaleX(1);
}

/* ✅ 动画 */
.signal-icon.animate .arc-inner {
  animation: pulse 1.2s infinite ease-in-out;
}

.signal-icon.animate .arc-outer {
  animation: pulse 1.2s infinite ease-in-out;
  animation-delay: 0.2s;
}

@keyframes pulse {
  0% {
    opacity: 0.2;
    transform: scale(0.98);
    transform-origin: center;
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.2;
    transform: scale(0.98);
  }
}
</style>
