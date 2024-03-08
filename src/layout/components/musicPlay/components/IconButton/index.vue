<script setup lang="ts">
import type { IconifyIcon } from "@iconify/types";

defineOptions({
  name: "IconButton"
});
const props = defineProps({
  icon: Object as PropType<IconifyIcon>,
  width: String,
  height: String
});
</script>

<template>
  <div class="icon-bg cursor-pointer">
    <IconifyIconOffline
      class="icon-scale"
      :icon="props.icon"
      :width="props.width"
      :height="props.height"
    />
  </div>
</template>

<style scoped lang="scss">
.icon-scale {
  cursor: pointer;
  transition: transform cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
}

.icon-scale:active {
  transform: scale(0.8, 0.8);
}

.icon-bg {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  //transition: transform ease-in-out 0.2s;
}

.icon-bg:hover {
  background: #dedede7c;
  border-radius: 1rem;
}

.icon-bg:active {
  background-color: #cecececb;
  border-radius: 1rem;
}
</style>
