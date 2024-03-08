<script setup lang="ts">
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { useDialog } from "@/layout/hooks/useDialog";
import { computed } from "vue";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";

defineOptions({
  name: "DialogPlayList"
});

const { widthRef } = useDialog();
const value = defineModel<boolean>();
const emits = defineEmits(["init"]);

const playingNowList = computed(() => {
  return storeHook.getPlayListMusic;
});

const storeHook = usePlaySongListStoreHook();
// 跳转到选择歌曲
const jumpMusic = (index: number) => {
  storeHook.seekMusicByIndex(index);
  emits("init");
  value.value = false;
};
</script>

<template>
  <el-dialog
    v-model="value"
    :width="widthRef"
    :show-close="false"
    :modal="false"
  >
    <div>
      <h1>当前播放</h1>
      <el-scrollbar height="20rem">
        <div
          v-for="(item, index) in playingNowList"
          :key="item.id"
          class="dialog-play-song-list space-x-4"
          @click="jumpMusic(index)"
        >
          <LoadImg
            height="3rem"
            width="3rem"
            radius="10px"
            :src="item.picUrl"
          />
          <span class="font-bold">
            {{ item.musicName }}
          </span>
          <span class="opacity-50">{{ item.aliasName }}</span>
        </div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-play-song-list {
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: 1rem;
}

.dialog-play-song-list:hover {
  background: rgb(98 97 97 / 37%);
}
</style>
