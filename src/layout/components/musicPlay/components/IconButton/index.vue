<script setup lang="ts">
import type { IconifyIcon } from "@iconify/types";
import { computed } from "vue";

defineOptions({
  name: "IconButton"
});
const props = defineProps({
  icon: Object as PropType<IconifyIcon>,
  width: String,
  height: String,
  bgHeight: {
    type: String,
    default: "4rem"
  },
  bgWidth: {
    type: String,
    default: "4rem"
  },
  BgBorderRadius: {
    type: String,
    default: "1rem"
  }
});
const bgHeight = computed(() => props.bgHeight);
const bgWidth = computed(() => props.bgWidth);
const BgBorderRadius = computed(() => props.BgBorderRadius);
</script>

<template>
  <div
    class="icon-bg cursor-pointer"
    :style="{
      width: bgWidth,
      height: bgHeight,
      'border-radius': BgBorderRadius
    }"
  >
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
