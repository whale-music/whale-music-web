<script setup lang="ts">
import PauseCircleBold from "@iconify-icons/solar/pause-circle-bold";
import PlayBold from "@iconify-icons/solar/play-bold";
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";
import IconifyIconOffline from "@/components/ReIcon/src/iconifyIconOffline";
import IconButton from "@/layout/components/musicPlay/components/IconButton/index.vue";

defineOptions({
  name: "IconPlayButton"
});
const props = defineProps({
  loading: {
    type: Boolean,
    required: true
  },
  isPlay: {
    type: Boolean,
    required: true
  }
});

const emits = defineEmits(["onPause", "onPlay"]);

const onPause = () => {
  emits("onPause");
};
const onPlay = () => {
  emits("onPlay");
};
</script>

<template>
  <div>
    <div v-if="props.loading">
      <div v-if="props.isPlay">
        <IconButton
          :icon="PauseCircleBold"
          width="3.25rem"
          height="3.25rem"
          @click="onPause"
        />
      </div>
      <div v-else>
        <IconButton
          :icon="PlayBold"
          width="3.25rem"
          height="3.25rem"
          @click="onPlay"
        />
      </div>
    </div>
    <IconifyIconOffline
      v-else
      :icon="Loading3Fill"
      class="animate-spin"
      width="3.25rem"
      height="3.25rem"
    />
  </div>
</template>
