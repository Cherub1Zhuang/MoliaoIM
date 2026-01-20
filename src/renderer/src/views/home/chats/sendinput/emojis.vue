<template>
  <div>
    <a-popover trigger="click">
      <template #content>
        <div class="grid grid-cols-14 gap-1">
          <div
            v-for="emoji in emojies"
            :key="emoji"
            class="w-6 h-6 rounded-[2px] flex items-center justify-center text-base hover:bg-stone-200 cursor-pointer"
            @click="$emit('select-emoji', emoji)"
          >
            {{ emoji }}
          </div>
        </div>
      </template>
      <Icon name="emoji" size="24" color="#666" class="focus:outline-none" />
    </a-popover>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const emojies = ref([
  ...'😊😨😍😳😎😭😌😵😴😢😅😡😜😀😲😟😤😞😫😣😈😉😯😕😰😋😝😓😃😂😘😒😏😶😱😖😩😔😑😚😪😇🙊👊👎☝✌😬😷🙈👌👏✊💪😆☺🙉👍🙏✋☀☕⛄📚🎁🎉🍦☁❄⚡💰🎂🎓🍖☔⛅✏💩🎄🍷🎤🏀🀄💣📢🌏🍫🎲🏂💡💤🚫🌻🍻🎵🏡💢📞🚿🍚👪👼💊🔫🌹🐶💄👫👽💋🌙🍉🐷💔👻👿💍🌲🐴👑🔥⭐⚽🕖⏰😁🚀⏳'
])
</script>

<style scoped></style>
