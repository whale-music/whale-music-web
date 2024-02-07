<script setup lang="ts">
import { h, markRaw, ref, watchEffect } from "vue";

import LinearCard from "@/components/Linear/Card/index.vue";
import HotMusic from "@/views/welcome/components/HotMusic/index.vue";
import MusicUpload from "@/views/welcome/components/MusicUpload/index.vue";

const props = defineProps({
  modelValue: {
    type: String as PropType<
      | "latest-upload"
      | "latest-music"
      | "latest-album"
      | "latest-artist"
      | "latest-mv"
      | "listening-history"
    >,
    required: true
  }
});

const compo = ref();
watchEffect(() => {
  switch (props.modelValue) {
    case "latest-upload":
      compo.value = markRaw(MusicUpload);
      break;
    case "latest-music":
      compo.value = markRaw(HotMusic);
      break;
    default:
      compo.value = markRaw(h("div"));
  }
});
</script>
<template>
  <LinearCard class="h-[90%] relative" shadow="never">
    <!--<MusicUpload />-->
    <component :is="compo" />
  </LinearCard>
</template>

<style scoped lang="scss">
@use "@/style/linear-card";
</style>
