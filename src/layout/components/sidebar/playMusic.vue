<script lang="ts" setup="">
import AlbumLine from "@iconify-icons/mingcute/album-line";
import { storageLocal } from "@pureadmin/utils";
import { defineComponent, reactive, watch } from "vue";

import MusicPlay from "@/layout/components/musicPlay/index.vue";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { emitter } from "@/utils/mitt";

defineComponent({
  name: "playMusic"
});

const state = reactive<{
  showPlayMusic: boolean;
}>({
  showPlayMusic: storageLocal().getItem<boolean>("showPlayMusic")
});

const storeHook = usePlaySongListStoreHook();

watch(
  () => state.showPlayMusic,
  value => {
    storageLocal().setItem<boolean>("showPlayMusic", value);
  }
);

emitter.on("openPlayMusic", () => {
  state.showPlayMusic = true;
});

emitter.on("closePlayMusic", () => {
  state.showPlayMusic = false;
});
</script>

<template>
  <div>
    <div class="cursor-pointer" @click="state.showPlayMusic = true">
      <div :class="{ 'animate-spin': storeHook.isPlay }">
        <IconifyIconOffline
          style="color: var(--el-color-primary)"
          width="1.8rem"
          height="1.8rem"
          :icon="AlbumLine"
        />
      </div>
    </div>
    <el-drawer
      v-model="state.showPlayMusic"
      style="

--el-drawer-padding-primary: 0"
      direction="btt"
      modal-class="drawer-music-play"
      :with-header="false"
      :append-to-body="true"
      size="100%"
    >
      <music-play />
    </el-drawer>
  </div>
</template>
