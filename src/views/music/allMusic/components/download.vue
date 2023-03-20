<script lang="ts" setup name="DownloadIcon">
import { Icon } from "@iconify/vue";
import { getMusicUrl } from "@/api/music";
const prop = defineProps({
  muiscId: Number
});

const downloadRes = async (url: string) => {
  window.open(url, "_self");
};

const downloadMusic = () => {
  getMusicUrl(prop.muiscId.toString()).then(res => {
    console.log(res);
    downloadRes(res.data[0]?.rawUrl);
  });
};
</script>

<template>
  <div class="cursor-pointer" @click="downloadMusic">
    <el-icon :size="20">
      <Icon icon="ic:sharp-cloud-download" />
    </el-icon>
  </div>
</template>

<style lang="scss" scoped>
// 样式
</style>
