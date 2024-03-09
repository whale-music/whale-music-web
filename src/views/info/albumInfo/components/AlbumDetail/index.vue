<script setup lang="ts">
import { dateFormater } from "@/utils/dateUtil";
import { AlbumInfo } from "@/api/model/Album";

defineOptions({
  name: "AlbumDetail"
});

const value = defineModel<boolean>();

const albumInfo = defineModel<AlbumInfo>("albumInfo");
</script>

<template>
  <!--显示专辑详细信息-->
  <el-dialog v-model="value" class="showDialog" width="45%" :show-close="false">
    <template #header>
      <h2>{{ albumInfo.albumName }}</h2>
      <span
        v-for="(item, index) in albumInfo.artistList"
        :key="index"
        class="text-sm text-neutral-400"
        >{{ item.artistName }}</span
      >
      <span class="text-sm text-neutral-400">&#32;·&#32;</span>
      <span class="text-sm text-neutral-400">
        {{ dateFormater("YYYY", albumInfo.publishTime) }}</span
      >
    </template>
    <el-scrollbar class="show-desc">
      <span class="whitespace-pre-wrap">{{ albumInfo.description }}</span>
    </el-scrollbar>
  </el-dialog>
</template>
