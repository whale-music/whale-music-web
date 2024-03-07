<script lang="ts" setup="">
import AlbumLine from "@iconify-icons/mingcute/album-line";
import { storageLocal } from "@pureadmin/utils";
import { computed, defineComponent, ref } from "vue";

import MusicPlay from "@/layout/components/musicPlay/index.vue";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import { emitter } from "@/utils/mitt";
import { message } from "@/utils/message";

defineComponent({
  name: "PlayMusic"
});

const k = "showPlayMusic";
const storeHook = usePlaySongListStoreHook();

const isShow = ref<boolean>(storageLocal().getItem<boolean>(k));
const isShowPlayMusic = computed<boolean>({
  get: () => storeHook.isNotEmpty && isShow.value,
  set: val => {
    isShow.value = val;
    storageLocal().setItem<boolean>(k, val);
  }
});

emitter.on("openPlayMusic", () => {
  isShowPlayMusic.value = true;
});

emitter.on("closePlayMusic", () => {
  isShowPlayMusic.value = false;
});

const showPlayMusic = () => {
  if (storeHook.isEmpty) {
    message("播放列表中无音乐");
    return;
  }
  isShowPlayMusic.value = true;
};
</script>

<template>
  <div>
    <div class="cursor-pointer" @click="showPlayMusic">
      <div :class="{ 'animate-spin': storeHook.isPlay }">
        <IconifyIconOffline
          :style="{
            color: storeHook.isEmpty
              ? 'var(--el-color-info)'
              : 'var(--el-color-primary)'
          }"
          width="1.8rem"
          height="1.8rem"
          :icon="AlbumLine"
        />
      </div>
    </div>
    <el-drawer
      v-model="isShowPlayMusic"
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
