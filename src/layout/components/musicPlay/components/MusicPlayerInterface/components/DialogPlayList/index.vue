<script setup lang="ts">
import LoadImg from "@/components/LoadImg/LoadImg.vue";
import { useDialog } from "@/layout/hooks/useDialog";
import { computed, nextTick } from "vue";
import { usePlaySongListStoreHook } from "@/store/modules/playSongList";
import CloseCircleLinear from "@iconify-icons/solar/close-circle-linear";
import IconButton from "@/layout/components/musicPlay/components/IconButton/index.vue";
import { useNav } from "@/layout/hooks/useNav";

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

// 移除歌曲
const { closePlayMusic } = useNav();
const removeMusic = async (musicId: number) => {
  value.value = false;
  await nextTick();
  storeHook.removeMusicByMusicId(musicId);
  if (storeHook.isEmpty) {
    closePlayMusic();
  }
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
          class="dialog-play-song-list"
        >
          <div
            class="flex items-center space-x-4 cursor-pointer"
            @click="jumpMusic(index)"
          >
            <LoadImg
              height="3rem"
              width="3rem"
              radius="10px"
              :src="item.picUrl"
            />
            <span class="font-bold max-w-40 truncate">
              {{ item.musicName }}
            </span>
            <span class="opacity-50">{{ item.aliasName }}</span>
          </div>
          <div class="remove-music">
            <IconButton
              :icon="CloseCircleLinear"
              width="1.5rem"
              height="1.5rem"
              bg-height="2.5rem"
              bg-width="2.5rem"
              @click="removeMusic(item.id)"
            />
          </div>
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
  justify-content: space-between;
  padding: 0.8rem;
  border-radius: 1rem;
}

.dialog-play-song-list:hover {
  background: rgb(98 97 97 / 37%);
}
</style>
