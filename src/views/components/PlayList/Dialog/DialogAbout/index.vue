<script setup lang="ts">
import { message } from "@/utils/message";
import { PlayInfoRes } from "@/api/playlist";
import WButton from "@/components/button/index.vue";

defineOptions({
  name: "DialogAbout"
});
const aboutFlag = defineModel<boolean>();
const playlistInfo = defineModel<PlayInfoRes>("playListInfo");
</script>

<template>
  <el-dialog v-model="aboutFlag" :show-close="false">
    <div>
      <div class="mb-4">
        <h2>歌单名</h2>
        <span>{{ playlistInfo.playListName }}</span>
      </div>
      <div class="mb-4">
        <h2>封面</h2>
        <span class="block truncate w-full">{{ playlistInfo.picUrl }}</span>
      </div>
      <div class="mb-4">
        <h2>歌单描述</h2>
        <span class="block truncate w-[23rem]">
          {{ playlistInfo.description }}
        </span>
      </div>
    </div>
    <template #header>
      <div class="relative">
        <WButton
          class="absolute right-4"
          @click="message('功能正在开发中', { type: 'info' })"
        >
          导出歌单
        </WButton>
      </div>
    </template>
  </el-dialog>
</template>
